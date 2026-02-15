import { NextRequest } from 'next/server';
import { stripeService } from '@/lib/integrations/stripe';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, serverError } from '@/lib/api/response';
import { getErrorMessage } from '@/lib/api/error-message';

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { paymentIntentId, amount } = body as {
      paymentIntentId: string;
      amount?: number;
    };

    if (!paymentIntentId) {
      return badRequest('Payment intent ID required');
    }

    if (amount !== undefined && (typeof amount !== 'number' || amount <= 0)) {
      return badRequest('Refund amount must be a positive number');
    }

    const refund = await stripeService.refundPayment(paymentIntentId, amount);

    return apiSuccess({
      refundId: refund.id,
      status: refund.status,
    });
  } catch (error) {
    console.error('Refund error:', error);
    return serverError(getErrorMessage(error, 'Failed to process refund'));
  }
}
