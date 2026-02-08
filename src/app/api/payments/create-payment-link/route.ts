import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, serverError } from '@/lib/api/response';

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  return new Stripe(key);
}

// Extended invoice type with Stripe fields (added via migration 00069)
interface InvoiceWithStripe {
  id: string;
  invoice_number: string;
  stripe_customer_id?: string;
  client?: { id: string; name: string; email?: string };
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;
  const stripe = getStripe();

  try {

    const body = await request.json();
    const { invoiceId, amount, currency = 'usd', description, customerEmail, metadata } = body;

    if (!invoiceId || !amount) {
      return badRequest('Missing required fields: invoiceId and amount');
    }

    // Get invoice details from database
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        client:companies(id, name, email),
        line_items:invoice_line_items(*)
      `)
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoiceData) {
      return notFound('Invoice');
    }

    const invoice = invoiceData as unknown as InvoiceWithStripe;

    // Create or retrieve Stripe customer
    let stripeCustomerId = invoice.stripe_customer_id;

    if (!stripeCustomerId && customerEmail) {
      const customers = await stripe.customers.list({
        email: customerEmail,
        limit: 1,
      });

      if (customers.data.length > 0) {
        stripeCustomerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: customerEmail,
          name: invoice.client?.name,
          metadata: {
            atlvs_company_id: invoice.client?.id || '',
            atlvs_invoice_id: invoiceId,
          },
        });
        stripeCustomerId = customer.id;
      }

      // Update invoice with Stripe customer ID (field added via migration)
      await supabase
        .from('invoices')
        .update({ stripe_customer_id: stripeCustomerId } as Record<string, unknown>)
        .eq('id', invoiceId);
    }

    // Create a Stripe product for this invoice
    const product = await stripe.products.create({
      name: `Invoice ${invoice.invoice_number}`,
      description: description || `Payment for Invoice ${invoice.invoice_number}`,
      metadata: {
        atlvs_invoice_id: invoiceId,
        invoice_number: invoice.invoice_number,
      },
    });

    // Create a price for the product
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
    });

    // Create the payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      metadata: {
        atlvs_invoice_id: invoiceId,
        invoice_number: invoice.invoice_number,
        ...metadata,
      },
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${process.env.NEXT_PUBLIC_APP_URL}/payments/success?invoice=${invoiceId}`,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_creation: stripeCustomerId ? undefined : 'if_required',
    });

    // Update invoice with payment link (fields added via migration)
    await supabase
      .from('invoices')
      .update({
        stripe_payment_link_id: paymentLink.id,
        stripe_payment_link_url: paymentLink.url,
        updated_at: new Date().toISOString(),
      } as Record<string, unknown>)
      .eq('id', invoiceId);

    return apiSuccess({
      id: paymentLink.id,
      url: paymentLink.url,
    });
  } catch (error) {
    console.error('Error creating payment link:', error);
    return serverError('Failed to create payment link');
  }
}
