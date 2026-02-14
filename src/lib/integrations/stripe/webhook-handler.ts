import { NextRequest } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { apiSuccess, badRequest, serverError } from "@/lib/api/response";
import { getStripeSecretKey, getStripeWebhookSecret } from "@/lib/env";
import { captureError } from "@/lib/observability";

function getStripe(): Stripe {
  return new Stripe(getStripeSecretKey());
}

export async function handleStripeWebhookRequest(request: NextRequest) {
  const webhookSecret = getStripeWebhookSecret();

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return badRequest("Missing stripe-signature header");
  }

  const stripe = getStripe();
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    captureError(error, "stripe.webhook.signature_verification_failed");
    return badRequest(
      error instanceof Error
        ? `Webhook signature verification failed: ${error.message}`
        : "Webhook signature verification failed"
    );
  }

  const supabase = await createServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(supabase, session);
        break;
      }
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(supabase, paymentIntent);
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(supabase, paymentIntent);
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleStripeInvoicePaid(supabase, invoice);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(supabase, subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(supabase, subscription);
        break;
      }
      default:
        return apiSuccess({ received: true, handled: false, event_type: event.type });
    }

    return apiSuccess({ received: true, handled: true, event_type: event.type });
  } catch (error) {
    captureError(error, "stripe.webhook.processing_failed", {
      event_type: event.type,
      request_id: request.headers.get("x-request-id") || undefined,
    });
    return serverError("Webhook processing failed");
  }
}

async function handleCheckoutComplete(
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  session: Stripe.Checkout.Session
) {
  const invoiceId = session.metadata?.atlvs_invoice_id;
  if (!invoiceId) return;

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : null;

  const { data: invoice } = await supabase
    .from("invoices")
    .select("organization_id, status")
    .eq("id", invoiceId)
    .maybeSingle();

  if (!invoice) return;

  if (invoice.status !== "paid") {
    await supabase
      .from("invoices")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        stripe_payment_intent_id: paymentIntentId,
        stripe_checkout_session_id: session.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", invoiceId);
  }

  if (!paymentIntentId) return;

  const { data: existingPayment } = await supabase
    .from("payments")
    .select("id")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();

  if (existingPayment) return;

  await supabase.from("payments").insert({
    invoice_id: invoiceId,
    organization_id: invoice.organization_id,
    amount: (session.amount_total || 0) / 100,
    currency: session.currency?.toUpperCase() || "USD",
    payment_method: "stripe" as const,
    payment_number: `STRIPE-${session.id}`,
    payment_date: new Date().toISOString(),
    status: "completed",
    stripe_payment_intent_id: paymentIntentId,
    reference_number: session.id,
  });
}

async function handlePaymentSucceeded(
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  paymentIntent: Stripe.PaymentIntent
) {
  const invoiceId = paymentIntent.metadata?.atlvs_invoice_id;
  if (!invoiceId) return;

  const { data: invoice } = await supabase
    .from("invoices")
    .select("status")
    .eq("id", invoiceId)
    .maybeSingle();

  if (invoice?.status === "paid") return;

  await supabase
    .from("invoices")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      stripe_payment_intent_id: paymentIntent.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", invoiceId);
}

async function handlePaymentFailed(
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  paymentIntent: Stripe.PaymentIntent
) {
  const invoiceId = paymentIntent.metadata?.atlvs_invoice_id;
  if (!invoiceId) return;

  await supabase.from("payment_attempts").insert({
    invoice_id: invoiceId,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency.toUpperCase(),
    status: "failed",
    stripe_payment_intent_id: paymentIntent.id,
    error_message: paymentIntent.last_payment_error?.message,
    created_at: new Date().toISOString(),
  });
}

async function handleStripeInvoicePaid(
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  stripeInvoice: Stripe.Invoice
) {
  const subscriptionId = (stripeInvoice as unknown as { subscription: string | null })
    .subscription;

  if (!subscriptionId) return;

  const { data: recurringInvoice } = await supabase
    .from("recurring_invoices")
    .select("id, invoices_generated_count")
    .eq("stripe_subscription_id", subscriptionId)
    .maybeSingle();

  if (!recurringInvoice) return;

  await supabase
    .from("recurring_invoices")
    .update({
      invoices_generated_count: (recurringInvoice.invoices_generated_count || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", recurringInvoice.id);
}

async function handleSubscriptionChange(
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  subscription: Stripe.Subscription
) {
  const recurringInvoiceId = subscription.metadata?.atlvs_recurring_invoice_id;
  if (!recurringInvoiceId) return;

  await supabase
    .from("recurring_invoices")
    .update({
      stripe_subscription_id: subscription.id,
      stripe_subscription_status: subscription.status,
      next_run_date: new Date(
        (subscription as unknown as { current_period_end: number }).current_period_end *
          1000
      ).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", recurringInvoiceId);
}

async function handleSubscriptionCanceled(
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  subscription: Stripe.Subscription
) {
  const recurringInvoiceId = subscription.metadata?.atlvs_recurring_invoice_id;
  if (!recurringInvoiceId) return;

  await supabase
    .from("recurring_invoices")
    .update({
      is_active: false,
      stripe_subscription_status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", recurringInvoiceId);
}
