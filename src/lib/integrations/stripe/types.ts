export interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  customerId?: string;
  metadata?: Record<string, string>;
  description?: string;
  receiptEmail?: string;
}

export interface CreateCustomerParams {
  email: string;
  name: string;
  phone?: string;
  metadata?: Record<string, string>;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
}

export interface CreateSubscriptionParams {
  customerId: string;
  priceId: string;
  quantity?: number;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
}

export interface CreateCheckoutSessionParams {
  lineItems: Array<{
    priceId: string;
    quantity: number;
  }>;
  mode: 'payment' | 'subscription' | 'setup';
  successUrl: string;
  cancelUrl: string;
  customerId?: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

export interface CreateInvoiceParams {
  customerId: string;
  items: Array<{
    priceId?: string;
    amount?: number;
    description?: string;
    quantity?: number;
  }>;
  daysUntilDue?: number;
  autoAdvance?: boolean;
  metadata?: Record<string, string>;
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
  created: number;
  livemode: boolean;
}

export interface StripeCustomer {
  id: string;
  email: string | null | undefined;
  name: string | null | undefined;
  phone: string | null | undefined;
  metadata: Record<string, string>;
  created: number;
}

export interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string | null;
  customer: string | null;
  metadata: Record<string, string>;
  created: number;
}

export interface StripeSubscription {
  id: string;
  customer: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  items: {
    data: Array<{
      id: string;
      price: {
        id: string;
        unit_amount: number | null;
        currency: string;
      };
      quantity: number;
    }>;
  };
  metadata: Record<string, string>;
}

export interface StripeInvoice {
  id: string;
  customer: string;
  status: string | null;
  amount_due: number;
  amount_paid: number;
  currency: string;
  hosted_invoice_url: string | null;
  pdf: string | null;
  created: number;
}

export interface StripeCheckoutSession {
  id: string;
  url: string | null;
  customer: string | null;
  payment_intent: string | null;
  subscription: string | null;
  status: string | null;
  mode: string;
}

export interface StripeRefund {
  id: string;
  amount: number;
  currency: string;
  payment_intent: string;
  status: string;
  reason: string | null;
  created: number;
}
