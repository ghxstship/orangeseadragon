import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';

/**
 * POST /api/invoices/check-overdue
 * Batch check and update overdue invoices
 * This should be called by a scheduled job (e.g., daily cron)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: NextRequest) {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    try {

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString().split('T')[0];

        // Find all invoices that are past due and eligible to be marked overdue
        const { data: overdueInvoices, error: fetchError } = await supabase
            .from('invoices')
            .select('id, invoice_number, organization_id, status, due_date, total_amount, amount_paid')
            .in('status', ['sent', 'viewed', 'partially_paid'])
            .lt('due_date', todayISO);

        if (fetchError) {
            return supabaseError(fetchError);
        }

        if (!overdueInvoices || overdueInvoices.length === 0) {
            return apiSuccess([], { message: 'No invoices to mark as overdue', updated_count: 0 });
        }

        // Batch update to overdue status
        const invoiceIds = overdueInvoices.map(inv => inv.id);

        const { error: updateError } = await supabase
            .from('invoices')
            .update({
                status: 'overdue',
                updated_at: new Date().toISOString(),
            })
            .in('id', invoiceIds);

        if (updateError) {
            return supabaseError(updateError);
        }

        // Create audit logs for each invoice
        const auditLogs = overdueInvoices.map(inv => ({
            organization_id: inv.organization_id,
            user_id: user?.id || null,
            action: 'invoice_marked_overdue',
            entity_type: 'invoice',
            entity_id: inv.id,
            old_values: { status: inv.status },
            new_values: { status: 'overdue' },
        }));

        await supabase.from('audit_logs').insert(auditLogs);

        // Create notifications for organization admins
        const orgsWithOverdue = Array.from(new Set(overdueInvoices.map(inv => inv.organization_id)));

        for (const orgId of orgsWithOverdue) {
            const orgInvoices = overdueInvoices.filter(inv => inv.organization_id === orgId);
            const totalAmount = orgInvoices.reduce((sum, inv) =>
                sum + (Number(inv.total_amount) - Number(inv.amount_paid)), 0
            );

            // Get org admins to notify
            const { data: admins } = await supabase
                .from('organization_members')
                .select('user_id')
                .eq('organization_id', orgId)
                .eq('is_owner', true);

            if (admins) {
                const notifications = admins.map(admin => ({
                    organization_id: orgId,
                    user_id: admin.user_id,
                    type: 'invoices_overdue',
                    title: `${orgInvoices.length} Invoice(s) Now Overdue`,
                    message: `Total outstanding: $${totalAmount.toFixed(2)}`,
                    data: { invoice_ids: orgInvoices.map(inv => inv.id) },
                    entity_type: 'invoice',
                }));

                await supabase.from('notifications').insert(notifications);
            }
        }

        return apiSuccess(
            overdueInvoices.map(inv => ({
                id: inv.id,
                invoice_number: inv.invoice_number,
                due_date: inv.due_date,
                amount_due: Number(inv.total_amount) - Number(inv.amount_paid),
            })),
            { message: `Marked ${overdueInvoices.length} invoices as overdue`, updated_count: overdueInvoices.length }
        );
    } catch (e) {
        console.error('[API] Batch overdue check error:', e);
        return serverError('Batch overdue check failed');
    }
}
