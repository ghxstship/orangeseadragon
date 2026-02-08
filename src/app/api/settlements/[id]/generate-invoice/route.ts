import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';

/**
 * POST /api/settlements/:id/generate-invoice
 * 
 * Generate a final invoice from an approved/finalized settlement.
 * Creates line items from settlement revenue/expense breakdown.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const { id: settlementId } = await params;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Stale Supabase types; function exists in migration 00086
    const { data, error } = await (supabase as any).rpc('generate_invoice_from_settlement', {
      p_settlement_id: settlementId,
      p_user_id: user.id,
    });

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess({ invoice_id: data });
  } catch (error) {
    console.error('Error generating invoice from settlement:', error);
    return serverError();
  }
}
