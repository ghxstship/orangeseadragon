import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/purchase-orders/[id]/submit
 * Submit a purchase order for approval
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServiceClient();
  const { id } = await params;

  try {
    // Get the purchase order
    const { data: po, error: fetchError } = await supabase
      .from('purchase_orders')
      .select('*, items:purchase_order_items(*)')
      .eq('id', id)
      .single();

    if (fetchError || !po) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 });
    }

    // Check if in correct status
    if (po.status !== 'draft') {
      return NextResponse.json({ 
        error: `Cannot submit PO with status: ${po.status}` 
      }, { status: 400 });
    }

    // Validate PO has items
    if (!po.items || po.items.length === 0) {
      return NextResponse.json({ 
        error: 'Cannot submit PO without line items' 
      }, { status: 400 });
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      purchase_order: data,
      message: 'Purchase order submitted for approval'
    });
  } catch (e) {
    console.error('[API] PO submit error:', e);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}
