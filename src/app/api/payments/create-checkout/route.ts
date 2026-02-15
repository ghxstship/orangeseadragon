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
    const { lineItems, mode = 'payment', successUrl, cancelUrl, customerEmail } = body as {
      lineItems: Array<{ priceId: string; quantity: number }>;
      mode?: 'payment' | 'subscription';
      successUrl: string;
      cancelUrl: string;
      customerEmail?: string;
    };

    if (!lineItems?.length) {
      return badRequest('Line items required');
    }

    if (!successUrl || !cancelUrl) {
      return badRequest('Success and cancel URLs required');
    }

    const session = await stripeService.createCheckoutSession(
      lineItems,
      mode,
      successUrl,
      cancelUrl,
      customerEmail
    );

    return apiSuccess({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Create checkout session error:', error);
    return serverError(getErrorMessage(error, 'Failed to create checkout session'));
  }
}
