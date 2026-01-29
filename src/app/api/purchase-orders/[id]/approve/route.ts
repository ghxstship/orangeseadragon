import { createUntypedClient as createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/purchase-orders/[id]/approve
 * Approve a purchase order
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the purchase order
    const { data: po, error: fetchError } = await supabase
      .from('purchase_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !po) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 });
    }

    // Check if in correct status
    if (po.status !== 'pending_approval') {
      return NextResponse.json({ 
        error: `Cannot approve PO with status: ${po.status}` 
      }, { status: 400 });
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      purchase_order: data,
      message: 'Purchase order approved'
    });
  } catch (e) {
    console.error('[API] PO approval error:', e);
    return NextResponse.json({ error: 'Approval failed' }, { status: 500 });
  }
}
