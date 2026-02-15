import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * POST /api/expenses/[id]/approve
 * Approve a submitted expense and update approval workflow
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const auth = await requirePolicy('finance.approve');
        if (auth.error) return auth.error;
        const { user, supabase } = auth;

        const body = await request.json();
        const { comments } = body;

        // Get the expense
        const { data: expense, error: fetchError } = await supabase
            .from('expenses')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !expense) {
            return notFound('Expense');
        }

        const approvableStatuses = ['submitted', 'pending_approval'];
        if (!approvableStatuses.includes(expense.status)) {
            return badRequest(`Expense with status '${expense.status}' cannot be approved`);
        }

        // Update pending approval request
        const { data: approvalRequest } = await supabase
            .from('approval_requests')
            .select('*')
            .eq('entity_type', 'expense')
            .eq('entity_id', id)
            .eq('status', 'pending')
            .single();

        if (approvalRequest) {
            // Record decision
            await supabase
                .from('approval_decisions')
                .insert({
                    approval_request_id: approvalRequest.id,
                    step_number: approvalRequest.current_step,
                    approver_id: user.id,
                    decision: 'approved',
                    comments: comments || null,
                    decided_at: new Date().toISOString(),
                });

            // Complete the approval request
            await supabase
                .from('approval_requests')
                .update({
                    status: 'approved',
                    completed_at: new Date().toISOString(),
                })
                .eq('id', approvalRequest.id);
        }

        // Update expense
        const { data: updatedExpense, error: updateError } = await supabase
            .from('expenses')
            .update({
                status: 'approved',
                approved_at: new Date().toISOString(),
                approved_by: user.id,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            return supabaseError(updateError);
        }

        // Notify expense owner
        await supabase
            .from('notifications')
            .insert({
                organization_id: expense.organization_id,
                user_id: expense.user_id,
                type: 'expense_approved',
                title: 'Expense Approved',
                message: `Your expense of $${expense.amount} has been approved`,
                data: { expense_id: id },
                entity_type: 'expense',
                entity_id: id,
            });

        // Audit log
        await supabase
            .from('audit_logs')
            .insert({
                organization_id: expense.organization_id,
                user_id: user.id,
                action: 'expense_approved',
                entity_type: 'expense',
                entity_id: id,
                old_values: { status: expense.status },
                new_values: { status: 'approved' },
            });

        return apiSuccess(updatedExpense, { message: 'Expense approved' });
    } catch (e) {
        captureError(e, 'api.expense_approve.unhandled', { expense_id: id });
        return serverError('Approval failed');
    }
}
