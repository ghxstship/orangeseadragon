import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';

/**
 * POST /api/purchase-orders/[id]/submit
 * Submit a purchase order for approval
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;
  const { id } = await params;

  try {
    // Get the purchase order
    const { data: po, error: fetchError } = await supabase
      .from('purchase_orders')
      .select('*, items:purchase_order_items(*)')
      .eq('id', id)
      .single();

    if (fetchError || !po) {
      return notFound('Purchase order');
    }

    // Check if in correct status
    if (po.status !== 'draft') {
      return badRequest(`Cannot submit PO with status: ${po.status}`);
    }

    // Validate PO has items
    if (!po.items || po.items.length === 0) {
      return badRequest('Cannot submit PO without line items');
    }

    // Update the purchase order
    const { data, error } = await supabase
      .from('purchase_orders')
      .update({
        status: 'pending_approval',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(data, { message: 'Purchase order submitted for approval' });
  } catch (e) {
    console.error('[API] PO submit error:', e);
    return serverError('Submission failed');
  }
}
