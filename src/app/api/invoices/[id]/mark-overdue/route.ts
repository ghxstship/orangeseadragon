import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * POST /api/invoices/[id]/mark-overdue
 * Mark an invoice as overdue (usually called by a scheduled job)
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

        // Get the invoice
        const { data: invoice, error: fetchError } = await supabase
            .from('invoices')
            .select('id, status, due_date, organization_id')
            .eq('id', id)
            .single();

        if (fetchError || !invoice) {
            return notFound('Invoice');
        }

        // Only process invoices that can become overdue
        const overdueableStatuses = ['sent', 'viewed', 'partially_paid'];
        if (!overdueableStatuses.includes(invoice.status)) {
            return badRequest(`Invoice with status '${invoice.status}' cannot be marked overdue`);
        }

        // Check if actually overdue
        const dueDate = new Date(invoice.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dueDate >= today) {
            return badRequest('Invoice is not yet overdue', { due_date: invoice.due_date });
        }

        // Update to overdue status
        const { data, error } = await supabase
            .from('invoices')
            .update({
                status: 'overdue',
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return supabaseError(error);
        }

        // Create audit log
        await supabase
            .from('audit_logs')
            .insert({
                organization_id: invoice.organization_id,
                user_id: user.id,
                action: 'invoice_marked_overdue',
                entity_type: 'invoice',
                entity_id: id,
                old_values: { status: invoice.status },
                new_values: { status: 'overdue' },
            });

        return apiSuccess(data, { message: 'Invoice marked as overdue' });
    } catch (e) {
        captureError(e, 'api.invoices.id.mark-overdue.error');
        return serverError('Failed to mark overdue');
    }
}
