import Stripe from 'stripe';
import { getStripeSecretKey, getStripeWebhookSecret } from '@/lib/env';

export interface PaymentIntentResult {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string | null;
}

export interface CustomerResult {
  id: string;
  email: string | null;
  name: string | null;
}

export interface CheckoutSessionResult {
  id: string;
  url: string | null;
}

export class StripeService {
  private stripe: Stripe | null = null;

  private getClient(): Stripe {
    if (!this.stripe) {
      this.stripe = new Stripe(getStripeSecretKey());
    }
    return this.stripe;
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata?: Record<string, string>
  ): Promise<PaymentIntentResult> {
    const stripe = this.getClient();
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      automatic_payment_methods: { enabled: true },
    });

    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      clientSecret: paymentIntent.client_secret,
    };
  }

  async confirmPaymentIntent(paymentIntentId: string): Promise<PaymentIntentResult> {
    const stripe = this.getClient();
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);

    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      clientSecret: paymentIntent.client_secret,
    };
  }

  async refundPayment(paymentIntentId: string, amount?: number): Promise<{ id: string; status: string }> {
    const stripe = this.getClient();
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount,
    });

    return {
      id: refund.id,
      status: refund.status || 'pending',
    };
  }

  async createCustomer(email: string, name: string, metadata?: Record<string, string>): Promise<CustomerResult> {
    const stripe = this.getClient();
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });

    return {
      id: customer.id,
      email: customer.email ?? null,
      name: customer.name ?? null,
    };
  }

  async getCustomer(customerId: string): Promise<CustomerResult | null> {
    const stripe = this.getClient();
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if ('deleted' in customer && customer.deleted) return null;

      return {
        id: customer.id,
        email: 'email' in customer ? customer.email ?? null : null,
        name: 'name' in customer ? customer.name ?? null : null,
      };
    } catch {
      return null;
    }
  }

  async createSubscription(
    customerId: string,
    priceId: string,
    trialDays?: number
  ): Promise<{ id: string; status: string }> {
    const stripe = this.getClient();
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      trial_period_days: trialDays,
    });

    return {
      id: subscription.id,
      status: subscription.status,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<{ id: string; status: string }> {
    const stripe = this.getClient();
    const subscription = await stripe.subscriptions.cancel(subscriptionId);

    return {
      id: subscription.id,
      status: subscription.status,
    };
  }

  async createCheckoutSession(
    lineItems: Array<{ priceId: string; quantity: number }>,
    mode: 'payment' | 'subscription',
    successUrl: string,
    cancelUrl: string,
    customerEmail?: string
  ): Promise<CheckoutSessionResult> {
    const stripe = this.getClient();
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: lineItems.map((item) => ({
        price: item.priceId,
        quantity: item.quantity,
      })),
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
    });

    return {
      id: session.id,
      url: session.url,
    };
  }

  async createInvoice(customerId: string, daysUntilDue = 30): Promise<{ id: string; status: string | null }> {
    const stripe = this.getClient();
    const invoice = await stripe.invoices.create({
      customer: customerId,
      days_until_due: daysUntilDue,
      auto_advance: true,
    });

    return {
      id: invoice.id,
      status: invoice.status,
    };
  }

  async sendInvoice(invoiceId: string): Promise<{ id: string; hostedUrl: string | null }> {
    const stripe = this.getClient();
    const invoice = await stripe.invoices.sendInvoice(invoiceId);

    return {
      id: invoice.id,
      hostedUrl: invoice.hosted_invoice_url ?? null,
    };
  }

  constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event {
    const stripe = this.getClient();
    return stripe.webhooks.constructEvent(payload, signature, getStripeWebhookSecret());
  }

  async listProducts(limit = 10): Promise<Stripe.Product[]> {
    const stripe = this.getClient();
    const products = await stripe.products.list({ limit, active: true });
    return products.data;
  }

  async listPrices(productId?: string, limit = 10): Promise<Stripe.Price[]> {
    const stripe = this.getClient();
    const prices = await stripe.prices.list({
      limit,
      active: true,
      product: productId,
    });
    return prices.data;
  }
}

export const stripeService = new StripeService();
