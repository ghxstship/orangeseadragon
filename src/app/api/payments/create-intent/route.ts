import { NextRequest } from 'next/server';
import { stripeService } from '@/lib/integrations/stripe';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, serverError } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { amount, currency = 'usd', metadata } = body as {
      amount: number;
      currency?: string;
      metadata?: Record<string, string>;
    };

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return badRequest('Amount must be a positive number');
    }

    const paymentIntent = await stripeService.createPaymentIntent(amount, currency, metadata);

    return apiSuccess({
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    return serverError(error instanceof Error ? error.message : 'Failed to create payment intent');
  }
}
