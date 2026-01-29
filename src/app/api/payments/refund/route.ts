import { NextRequest, NextResponse } from 'next/server';
import { stripeService } from '@/lib/integrations/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId, amount } = body as {
      paymentIntentId: string;
      amount?: number;
    };

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Payment intent ID required' }, { status: 400 });
    }

    const refund = await stripeService.refundPayment(paymentIntentId, amount);

    return NextResponse.json({
      refundId: refund.id,
      status: refund.status,
    });
  } catch (error) {
    console.error('Refund error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process refund' },
      { status: 500 }
    );
  }
}
