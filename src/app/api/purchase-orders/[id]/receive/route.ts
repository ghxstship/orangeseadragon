import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, serverError } from '@/lib/api/response';

/**
 * POST /api/purchase-orders/[id]/receive
 * Receive items from a purchase order and update inventory quantities
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

        const body = await request.json();
        const { items, notes } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return badRequest('Items to receive are required');
        }

        // Get the PO
        const { data: po, error: fetchError } = await supabase
            .from('purchase_orders')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !po) {
            return notFound('Purchase Order');
        }

        // Check if PO status allows receiving
        const receivableStatuses = ['sent', 'acknowledged', 'partially_received'];
        if (!receivableStatuses.includes(po.status)) {
            return badRequest(`Purchase Order with status '${po.status}' cannot receive items`);
        }

        // Process receiving for each item
        for (const item of items) {
            const { po_item_id, quantity_received, asset_id, warehouse_id } = item;

            if (!po_item_id || !quantity_received) continue;

            // 1. Update PO item quantities
            const { data: poItem } = await supabase
                .from('purchase_order_items')
                .select('quantity_ordered, quantity_received')
                .eq('id', po_item_id)
                .single();

            if (poItem) {
                const newTotalReceived = (poItem.quantity_received || 0) + quantity_received;
                await supabase
                    .from('purchase_order_items')
                    .update({
                        quantity_received: newTotalReceived,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', po_item_id);
            }

            // 2. Update Inventory if asset_id is provided
            if (asset_id && warehouse_id) {
                // Find existing inventory record
                const { data: inventory } = await supabase
                    .from('inventory')
                    .select('id, quantity_available, quantity_total')
                    .eq('asset_id', asset_id)
                    .eq('warehouse_id', warehouse_id)
                    .single();

                if (inventory) {
                    // Update existing
                    await supabase
                        .from('inventory')
                        .update({
                            quantity_total: (inventory.quantity_total || 0) + quantity_received,
                            quantity_available: (inventory.quantity_available || 0) + quantity_received,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', inventory.id);
                } else {
                    // Create new record
                    await supabase
                        .from('inventory')
                        .insert({
                            organization_id: po.organization_id,
                            asset_id,
                            warehouse_id,
                            quantity_total: quantity_received,
                            quantity_available: quantity_received,
                            status: 'available',
                        });
                }

                // 3. Create inventory transaction log
                await supabase
                    .from('inventory_transactions')
                    .insert({
                        organization_id: po.organization_id,
                        asset_id,
                        warehouse_id,
                        transaction_type: 'purchase_receipt',
                        quantity: quantity_received,
                        reference_type: 'purchase_order',
                        reference_id: id,
                        notes: notes || `Received from PO ${po.po_number}`,
                        created_by: user.id,
                    });
            }
        }

        // Check if transition to 'received' or 'partially_received' is needed
        const { data: allItems } = await supabase
            .from('purchase_order_items')
            .select('quantity_ordered, quantity_received')
            .eq('purchase_order_id', id);

        let allReceived = true;
        if (allItems) {
            for (const poItem of allItems) {
                if ((poItem.quantity_received || 0) < poItem.quantity_ordered) {
                    allReceived = false;
                    break;
                }
            }
        }

        const newStatus = allReceived ? 'received' : 'partially_received';

        await supabase
            .from('purchase_orders')
            .update({
                status: newStatus,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);

        // Audit log
        await supabase
            .from('audit_logs')
            .insert({
                organization_id: po.organization_id,
                user_id: user.id,
                action: 'po_items_received',
                entity_type: 'purchase_order',
                entity_id: id,
                new_values: {
                    received_status: newStatus,
                    items_received: items.length,
                },
            });

        return apiSuccess(
            { status: newStatus },
            { message: allReceived ? 'All items received' : 'Items partially received and inventory updated' }
        );
    } catch (e) {
        console.error('[API] PO receipt error:', e);
        return serverError('Receipt processing failed');
    }
}
