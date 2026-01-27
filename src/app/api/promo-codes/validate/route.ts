import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/promo-codes/validate
 * Validate a promo code for an event
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    const body = await request.json();
    const { code, event_id, order_amount_cents } = body;

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    // Find the promo code
    const { data: promoCode, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !promoCode) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Invalid promo code' 
      }, { status: 404 });
    }

    // Check if active
    if (!promoCode.is_active) {
      return NextResponse.json({ 
        valid: false, 
        error: 'This promo code is no longer active' 
      });
    }

    // Check event restriction
    if (promoCode.event_id && event_id && promoCode.event_id !== event_id) {
      return NextResponse.json({ 
        valid: false, 
        error: 'This promo code is not valid for this event' 
      });
    }

    // Check validity period
    const now = new Date();
    if (promoCode.valid_from && new Date(promoCode.valid_from) > now) {
      return NextResponse.json({ 
        valid: false, 
        error: 'This promo code is not yet valid' 
      });
    }

    if (promoCode.valid_until && new Date(promoCode.valid_until) < now) {
      return NextResponse.json({ 
        valid: false, 
        error: 'This promo code has expired' 
      });
    }

    // Check usage limit
    if (promoCode.max_uses && promoCode.uses_count >= promoCode.max_uses) {
      return NextResponse.json({ 
        valid: false, 
        error: 'This promo code has reached its usage limit' 
      });
    }

    // Check minimum order amount
    if (promoCode.min_order_amount_cents && order_amount_cents) {
      if (order_amount_cents < promoCode.min_order_amount_cents) {
        return NextResponse.json({ 
          valid: false, 
          error: `Minimum order amount of $${(promoCode.min_order_amount_cents / 100).toFixed(2)} required` 
        });
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

    return NextResponse.json({
      valid: true,
      promo_code: {
        id: promoCode.id,
        code: promoCode.code,
        description: promoCode.description,
        discount_type: promoCode.discount_type,
        discount_value: promoCode.discount_value,
      },
      discount_cents,
      message: promoCode.description || 'Promo code applied!'
    });

  } catch (e) {
    console.error('[API] Promo code validation error:', e);
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
  }
}
