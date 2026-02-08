import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { apiSuccess, badRequest, serverError } from '@/lib/api/response';

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  return new Stripe(key);
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return serverError('STRIPE_WEBHOOK_SECRET environment variable is not set');
  }

  const stripe = getStripe();
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return badRequest('Webhook signature verification failed');
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(supabase, session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(supabase, paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(supabase, paymentIntent);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleStripeInvoicePaid(supabase, invoice);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(supabase, subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(supabase, subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return apiSuccess({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return serverError('Webhook processing failed');
  }
}

async function handleCheckoutComplete(
  supabase: Awaited<ReturnType<typeof createClient>>,
  session: Stripe.Checkout.Session
) {
  const invoiceId = session.metadata?.atlvs_invoice_id;

  if (!invoiceId) {
    console.log('No ATLVS invoice ID in checkout session metadata');
    return;
  }

  // Update invoice status to paid
  await supabase
    .from('invoices')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      stripe_payment_intent_id: session.payment_intent as string,
      stripe_checkout_session_id: session.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', invoiceId);

  // Create a payment record
  // Get organization_id from the invoice
  const { data: inv } = await supabase.from('invoices').select('organization_id').eq('id', invoiceId).single();
  if (inv) {
    await supabase.from('payments').insert({
      invoice_id: invoiceId,
      organization_id: inv.organization_id,
      amount: (session.amount_total || 0) / 100,
      currency: session.currency?.toUpperCase() || 'USD',
      payment_method: 'stripe' as const,
      payment_number: `STRIPE-${session.id}`,
      payment_date: new Date().toISOString(),
      status: 'completed',
      stripe_payment_intent_id: session.payment_intent as string,
      reference_number: session.id,
    });
  }

  console.log(`Invoice ${invoiceId} marked as paid via Stripe checkout`);
}

async function handlePaymentSucceeded(
  supabase: Awaited<ReturnType<typeof createClient>>,
  paymentIntent: Stripe.PaymentIntent
) {
  const invoiceId = paymentIntent.metadata?.atlvs_invoice_id;

  if (!invoiceId) {
    return;
  }

  // Update invoice if not already paid
  const { data: invoice } = await supabase
    .from('invoices')
    .select('status')
    .eq('id', invoiceId)
    .single();

  if (invoice?.status !== 'paid') {
    await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        stripe_payment_intent_id: paymentIntent.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoiceId);
  }
}

async function handlePaymentFailed(
  supabase: Awaited<ReturnType<typeof createClient>>,
  paymentIntent: Stripe.PaymentIntent
) {
  const invoiceId = paymentIntent.metadata?.atlvs_invoice_id;

  if (!invoiceId) {
    return;
  }

  // Log the failed payment attempt
  await supabase.from('payment_attempts').insert({
    invoice_id: invoiceId,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency.toUpperCase(),
    status: 'failed',
    stripe_payment_intent_id: paymentIntent.id,
    error_message: paymentIntent.last_payment_error?.message,
    created_at: new Date().toISOString(),
  });

  console.log(`Payment failed for invoice ${invoiceId}`);
}

async function handleStripeInvoicePaid(
  supabase: Awaited<ReturnType<typeof createClient>>,
  stripeInvoice: Stripe.Invoice
) {
  // Handle Stripe-generated invoices (for subscriptions)
  const subscriptionId = (stripeInvoice as unknown as { subscription: string | null }).subscription;

  if (subscriptionId) {
    // Find recurring invoice by subscription ID
    const { data: recurringInvoice } = await supabase
      .from('recurring_invoices')
      .select('id')
      .eq('stripe_subscription_id', subscriptionId)
      .single();

    if (recurringInvoice) {
      // Increment invoices generated count
      await supabase
        .from('recurring_invoices')
        .update({
          invoices_generated_count: (recurringInvoice as unknown as { invoices_generated_count: number }).invoices_generated_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', recurringInvoice.id);
    }
  }
}

async function handleSubscriptionChange(
  supabase: Awaited<ReturnType<typeof createClient>>,
  subscription: Stripe.Subscription
) {
  const recurringInvoiceId = subscription.metadata?.atlvs_recurring_invoice_id;

  if (!recurringInvoiceId) {
    return;
  }

  await supabase
    .from('recurring_invoices')
    .update({
      stripe_subscription_id: subscription.id,
      stripe_subscription_status: subscription.status,
      next_run_date: new Date(((subscription as unknown as { current_period_end: number }).current_period_end) * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', recurringInvoiceId);
}

async function handleSubscriptionCanceled(
  supabase: Awaited<ReturnType<typeof createClient>>,
  subscription: Stripe.Subscription
) {
  const recurringInvoiceId = subscription.metadata?.atlvs_recurring_invoice_id;

  if (!recurringInvoiceId) {
    return;
  }

  await supabase
    .from('recurring_invoices')
    .update({
      is_active: false,
      stripe_subscription_status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', recurringInvoiceId);
}
