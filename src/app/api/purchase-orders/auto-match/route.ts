import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, supabaseError, serverError } from '@/lib/api/response';

/**
 * POST /api/purchase-orders/auto-match
 * 
 * Run the PO-to-invoice auto-matching algorithm for an organization.
 * Matches approved POs to incoming invoices by vendor and amount (5% tolerance).
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const { organization_id } = await request.json();

    if (!organization_id) {
      return badRequest('organization_id is required');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Stale Supabase types; function exists in migration 00085
    const { data, error } = await (supabase as any).rpc('auto_match_po_invoices', {
      p_organization_id: organization_id,
    });

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess({ matched_count: data }, {
      message: `Auto-matched ${data} purchase order(s) to invoices`,
    });
  } catch (error) {
    console.error('Error auto-matching POs:', error);
    return serverError();
  }
}
