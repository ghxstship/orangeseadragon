import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * POST /api/purchase-orders/auto-match
 * 
 * Run the PO-to-invoice auto-matching algorithm for an organization.
 * Matches approved POs to incoming invoices by vendor and amount (5% tolerance).
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const { organization_id } = await request.json();

    if (!organization_id) {
      return badRequest('organization_id is required');
    }

    const { data, error } = await supabase.rpc('auto_match_po_invoices', {
      p_organization_id: organization_id,
    });

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess({ matched_count: data }, {
      message: `Auto-matched ${data} purchase order(s) to invoices`,
    });
  } catch (error) {
    captureError(error, 'api.purchase-orders.auto-match.error');
    return serverError('Failed to auto-match purchase orders');
  }
}
