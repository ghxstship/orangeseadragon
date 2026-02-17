import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * POST /api/purchase-orders/[id]/approve
 * Approve a purchase order
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    // Get the purchase order
    const { data: po, error: fetchError } = await supabase
      .from('purchase_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !po) {
      return notFound('Purchase order');
    }

    // Check if in correct status
    if (po.status !== 'pending_approval') {
      return badRequest(`Cannot approve PO with status: ${po.status}`);
    }

    // Update the purchase order
    const { data, error } = await supabase
      .from('purchase_orders')
      .update({
        status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(data, { message: 'Purchase order approved' });
  } catch (e) {
    captureError(e, 'api.purchase-orders.id.approve.error');
    return serverError('Approval failed');
  }
}
