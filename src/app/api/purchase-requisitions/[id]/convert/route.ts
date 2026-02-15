import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';

/**
 * POST /api/purchase-requisitions/[id]/convert
 * Convert an approved purchase requisition into a Purchase Order
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;
        const { user, supabase } = auth;

        // 1. Fetch the requisition and its items
        const { data: requisition, error: reqError } = await supabase
            .from('purchase_requisitions')
            .select('*, items:purchase_requisition_items(*)')
            .eq('id', id)
            .single();

        if (reqError || !requisition) {
            return notFound('Requisition');
        }

        // 2. Validate requisition status
        if (requisition.status !== 'approved') {
            return badRequest(`Only approved requisitions can be converted. Current status: ${requisition.status}`);
        }

        // 3. Check if already converted
        const { data: existingPO } = await supabase
            .from('purchase_orders')
            .select('po_number')
            .eq('requisition_id', id)
            .single();

        if (existingPO) {
            return badRequest(`Requisition already converted to PO ${existingPO.po_number}`);
        }

        // 4. Group items by preferred vendor if applicable, or just create one PO for now
        // For simplicity, we create one PO. In a real system, we might create multiple POs if vendors differ.
        const requisitionItems = (requisition.items ?? []) as Array<{
            id: string;
            preferred_vendor_id?: string | null;
            description: string;
            quantity: number;
            estimated_unit_price?: number | null;
            estimated_total?: number | null;
            unit_of_measure?: string | null;
            position?: number | null;
            notes?: string | null;
        }>;
        const vendorId = requisitionItems[0]?.preferred_vendor_id || null;

        // 5. Create the Purchase Order
        const poNumber = `PO-${Date.now().toString().slice(-6)}`;
        const { data: po, error: poError } = await supabase
            .from('purchase_orders')
            .insert({
                organization_id: requisition.organization_id,
                project_id: requisition.project_id,
                event_id: requisition.event_id,
                requisition_id: id,
                vendor_id: vendorId,
                po_number: poNumber,
                status: 'draft',
                order_date: new Date().toISOString().split('T')[0],
                subtotal: requisition.estimated_total || 0,
                total_amount: requisition.estimated_total || 0,
                currency: requisition.currency || 'USD',
                created_by: user.id
            })
            .select()
            .single();

        if (poError || !po) {
            return serverError(poError?.message || 'Failed to create PO');
        }

        // 6. Create PO Items
        const poItems = requisitionItems.map((item) => ({
            purchase_order_id: po.id,
            requisition_item_id: item.id,
            description: item.description,
            quantity_ordered: item.quantity,
            unit_price: item.estimated_unit_price || 0,
            line_total: item.estimated_total || 0,
            unit_of_measure: item.unit_of_measure,
            position: item.position,
            notes: item.notes
        }));

        const { error: itemsError } = await supabase
            .from('purchase_order_items')
            .insert(poItems);

        if (itemsError) {
            // Rollback PO if items fail (manually since no transactions in simple client)
            await supabase.from('purchase_orders').delete().eq('id', po.id);
            return supabaseError(itemsError);
        }

        // 7. Update requisition status
        await supabase
            .from('purchase_requisitions')
            .update({ status: 'ordered' })
            .eq('id', id);

        // 8. Audit Log
        await supabase
            .from('audit_logs')
            .insert({
                organization_id: requisition.organization_id,
                user_id: user.id,
                action: 'requisition_converted',
                entity_type: 'purchase_requisition',
                entity_id: id,
                new_values: { po_id: po.id, po_number: poNumber },
            });

        return apiSuccess(po, { message: `Requisition converted to PO ${poNumber}` });
    } catch (e) {
        console.error('[API] Requisition convert error:', e);
        return serverError('Conversion failed');
    }
}
