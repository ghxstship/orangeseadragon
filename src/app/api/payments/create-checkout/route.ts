import { NextRequest, NextResponse } from 'next/server';
import { stripeService } from '@/lib/integrations/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lineItems, mode = 'payment', successUrl, cancelUrl, customerEmail } = body as {
      lineItems: Array<{ priceId: string; quantity: number }>;
      mode?: 'payment' | 'subscription';
      successUrl: string;
      cancelUrl: string;
      customerEmail?: string;
    };

    if (!lineItems?.length) {
      return NextResponse.json({ error: 'Line items required' }, { status: 400 });
    }

    if (!successUrl || !cancelUrl) {
      return NextResponse.json({ error: 'Success and cancel URLs required' }, { status: 400 });
    }

    const session = await stripeService.createCheckoutSession(
      lineItems,
      mode,
      successUrl,
      cancelUrl,
      customerEmail
    );

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Create checkout session error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
