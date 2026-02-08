import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, serverError } from '@/lib/api/response';

/**
 * POST /api/promo-codes/validate
 * Validate a promo code for an event
 */
export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;

  try {
    const body = await request.json();
    const { code, event_id, order_amount_cents } = body;

    if (!code) {
      return badRequest('Code is required');
    }

    // Find the promo code
    const { data: promoCode, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !promoCode) {
      return notFound('Promo code');
    }

    // Check if active
    if (!promoCode.is_active) {
      return badRequest('This promo code is no longer active');
    }

    // Check event restriction
    if (promoCode.event_id && event_id && promoCode.event_id !== event_id) {
      return badRequest('This promo code is not valid for this event');
    }

    // Check validity period
    const now = new Date();
    if (promoCode.valid_from && new Date(promoCode.valid_from) > now) {
      return badRequest('This promo code is not yet valid');
    }

    if (promoCode.valid_until && new Date(promoCode.valid_until) < now) {
      return badRequest('This promo code has expired');
    }

    // Check usage limit
    if (promoCode.max_uses && promoCode.uses_count >= promoCode.max_uses) {
      return badRequest('This promo code has reached its usage limit');
    }

    // Check minimum order amount
    if (promoCode.min_order_amount_cents && order_amount_cents) {
      if (order_amount_cents < promoCode.min_order_amount_cents) {
        return badRequest(`Minimum order amount of $${(promoCode.min_order_amount_cents / 100).toFixed(2)} required`);
      }
    }

    // Calculate discount
    let discount_cents = 0;
    if (promoCode.discount_type === 'percentage') {
      discount_cents = order_amount_cents 
        ? Math.round(order_amount_cents * (promoCode.discount_value / 100))
        : 0;
    } else {
      discount_cents = promoCode.discount_value;
    }

    return apiSuccess({
      valid: true,
      promo_code: {
        id: promoCode.id,
        code: promoCode.code,
        description: promoCode.description,
        discount_type: promoCode.discount_type,
        discount_value: promoCode.discount_value,
      },
      discount_cents,
    }, { message: promoCode.description || 'Promo code applied!' });

  } catch (e) {
    console.error('[API] Promo code validation error:', e);
    return serverError('Validation failed');
  }
}
