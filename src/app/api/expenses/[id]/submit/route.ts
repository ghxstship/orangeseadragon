import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * POST /api/expenses/[id]/submit
 * Submit an expense for approval - integrates with approval workflow system
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const auth = await requirePolicy('entity.write');
        if (auth.error) return auth.error;
        const { user, supabase } = auth;

        // Get the expense
        const { data: expense, error: fetchError } = await supabase
            .from('expenses')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !expense) {
            return notFound('Expense');
        }

        // Validate current status
        if (expense.status !== 'draft') {
            return badRequest(`Expense with status '${expense.status}' cannot be submitted`);
        }

        // Validate receipt is attached for reimbursable expenses
        if (expense.is_reimbursable && !expense.receipt_url) {
            return badRequest('Receipt is required for reimbursable expenses');
        }

        // Update expense status
        const { data: updatedExpense, error: updateError } = await supabase
            .from('expenses')
            .update({
                status: 'submitted',
                submitted_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            return supabaseError(updateError);
        }

        // Find applicable approval workflow
        const { data: workflow } = await supabase
            .from('approval_workflows')
            .select('*')
            .eq('organization_id', expense.organization_id)
            .eq('entity_type', 'expense')
            .eq('is_active', true)
            .single();

        let approvalRequest: any = null;

        if (workflow) {
            // Create approval request
            const { data: request } = await supabase
                .from('approval_requests')
                .insert({
                    organization_id: expense.organization_id,
                    approval_workflow_id: workflow.id,
                    entity_type: 'expense',
                    entity_id: id,
                    status: 'pending',
                    requested_by: user.id,
                    requested_at: new Date().toISOString(),
                })
                .select()
                .single();

            approvalRequest = request;

            // Notify approvers
            const approvers = await getExpenseApprovers(supabase, workflow, expense);

            if (approvers.length > 0) {
                const notifications = approvers.map(approverId => ({
                    organization_id: expense.organization_id,
                    user_id: approverId,
                    type: 'expense_pending_approval',
                    title: 'Expense Pending Approval',
                    message: `Expense of $${expense.amount} requires your approval`,
                    data: {
                        expense_id: id,
                        amount: expense.amount,
                        description: expense.description,
                    },
                    entity_type: 'expense',
                    entity_id: id,
                }));

                await supabase.from('notifications').insert(notifications);
            }
        }

        // Audit log
        await supabase
            .from('audit_logs')
            .insert({
                organization_id: expense.organization_id,
                user_id: user.id,
                action: 'expense_submitted',
                entity_type: 'expense',
                entity_id: id,
                old_values: { status: 'draft' },
                new_values: { status: 'submitted' },
            });

        return apiSuccess(updatedExpense, {
            approval_request: approvalRequest,
            message: 'Expense submitted for approval',
        });
    } catch (e) {
        captureError(e, 'api.expense_submit.unhandled', { expense_id: id });
        return serverError('Submission failed');
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client type
async function getExpenseApprovers(
    supabase: any,
    workflow: { approval_type: string; config: Record<string, unknown> },
    expense: { organization_id: string; user_id: string }
): Promise<string[]> {
    const approvers: string[] = [];

    switch (workflow.approval_type) {
        case 'manager_hierarchy':
            const { data: member } = await supabase
                .from('organization_members')
                .select('department_id')
                .eq('user_id', expense.user_id)
                .eq('organization_id', expense.organization_id)
                .single();

            if (member?.department_id) {
                const { data: dept } = await supabase
                    .from('departments')
                    .select('manager_id')
                    .eq('id', member.department_id)
                    .single();

                if (dept?.manager_id) {
                    approvers.push(dept.manager_id);
                }
            }
            break;

        case 'role_based':
            const roleId = (workflow.config as { approver_role_id?: string })?.approver_role_id;
            if (roleId) {
                const { data: roleMembers } = await supabase
                    .from('organization_members')
                    .select('user_id')
                    .eq('organization_id', expense.organization_id)
                    .eq('role_id', roleId);

                if (roleMembers) {
                    approvers.push(...roleMembers.map((m: { user_id: string }) => m.user_id));
                }
            }
            break;
    }

    return approvers;
}
