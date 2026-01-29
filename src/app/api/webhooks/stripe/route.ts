import { NextRequest, NextResponse } from 'next/server';
import { stripeService } from '@/lib/integrations/stripe';

const HANDLED_EVENTS = [
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'invoice.paid',
  'invoice.payment_failed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'charge.refunded',
  'checkout.session.completed',
] as const;

type HandledEvent = (typeof HANDLED_EVENTS)[number];

async function handleStripeEvent(eventType: HandledEvent, data: Record<string, unknown>) {
  switch (eventType) {
    case 'payment_intent.succeeded':
      console.log('[Stripe] Payment succeeded:', data.id, 'Amount:', data.amount);
      break;
    case 'payment_intent.payment_failed':
      console.log('[Stripe] Payment failed:', data.id);
      break;
    case 'invoice.paid':
      console.log('[Stripe] Invoice paid:', data.id, 'Customer:', data.customer);
      break;
    case 'invoice.payment_failed':
      console.log('[Stripe] Invoice payment failed:', data.id);
      break;
    case 'customer.subscription.created':
      console.log('[Stripe] Subscription created:', data.id, 'Status:', data.status);
      break;
    case 'customer.subscription.updated':
      console.log('[Stripe] Subscription updated:', data.id, 'Status:', data.status);
      break;
    case 'customer.subscription.deleted':
      console.log('[Stripe] Subscription deleted:', data.id);
      break;
    case 'charge.refunded':
      console.log('[Stripe] Charge refunded:', data.id, 'Amount:', data.amount_refunded);
      break;
    case 'checkout.session.completed':
      console.log('[Stripe] Checkout completed:', data.id, 'Mode:', data.mode);
      break;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  try {
    const event = stripeService.constructWebhookEvent(body, signature);

    if (HANDLED_EVENTS.includes(event.type as HandledEvent)) {
      await handleStripeEvent(event.type as HandledEvent, event.data.object as unknown as Record<string, unknown>);
      return NextResponse.json({ received: true, handled: true });
    }

    return NextResponse.json({ received: true, handled: false });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
