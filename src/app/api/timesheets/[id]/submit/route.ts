import { NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';

/**
 * POST /api/timesheets/[id]/submit
 * Submit a timesheet for approval - integrates with approval workflow system
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

        // Get the timesheet
        const { data: timesheet, error: fetchError } = await supabase
            .from('timesheets')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !timesheet) {
            return notFound('Timesheet');
        }

        // Validate status allows submission
        if (timesheet.status !== 'draft') {
            return badRequest(`Timesheet with status '${timesheet.status}' cannot be submitted`);
        }

        // Validate timesheet has entries
        const { count: entryCount } = await supabase
            .from('timesheet_entries')
            .select('*', { count: 'exact', head: true })
            .eq('timesheet_id', id);

        if (!entryCount || entryCount === 0) {
            return badRequest('Cannot submit empty timesheet');
        }

        // Update timesheet status
        const { data: updatedTimesheet, error: updateError } = await supabase
            .from('timesheets')
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

        // Find applicable approval workflow for timesheets
        const { data: workflow } = await supabase
            .from('approval_workflows')
            .select('*')
            .eq('organization_id', timesheet.organization_id)
            .eq('entity_type', 'timesheet')
            .eq('is_active', true)
            .single();

        let approvalRequest: Record<string, unknown> | null = null;

        if (workflow) {
            // Create approval request
            const { data: request, error: approvalError } = await supabase
                .from('approval_requests')
                .insert({
                    organization_id: timesheet.organization_id,
                    approval_workflow_id: workflow.id,
                    entity_type: 'timesheet',
                    entity_id: id,
                    status: 'pending',
                    requested_by: user.id,
                    requested_at: new Date().toISOString(),
                    current_step: 1,
                    total_steps: workflow.config?.steps?.length || 1,
                })
                .select()
                .single();

            if (!approvalError) {
                approvalRequest = request;
            }

            // Notify approvers based on workflow type
            const approvers = await getApprovers(supabase, workflow, timesheet);

            if (approvers.length > 0) {
                const notifications = approvers.map(approverId => ({
                    organization_id: timesheet.organization_id,
                    user_id: approverId,
                    type: 'timesheet_pending_approval',
                    title: 'Timesheet Pending Approval',
                    message: `A timesheet requires your approval`,
                    data: {
                        timesheet_id: id,
                        approval_request_id: approvalRequest?.id,
                    },
                    entity_type: 'timesheet',
                    entity_id: id,
                }));

                await supabase.from('notifications').insert(notifications);
            }
        }

        // Create audit log
        await supabase
            .from('audit_logs')
            .insert({
                organization_id: timesheet.organization_id,
                user_id: user.id,
                action: 'timesheet_submitted',
                entity_type: 'timesheet',
                entity_id: id,
                old_values: { status: 'draft' },
                new_values: { status: 'submitted' },
            });

        return apiSuccess(updatedTimesheet, {
            approval_request: approvalRequest,
            message: 'Timesheet submitted for approval',
        });
    } catch (e) {
        console.error('[API] Timesheet submit error:', e);
        return serverError('Submission failed');
    }
}

/**
 * Helper to get approvers based on workflow configuration
 */
async function getApprovers(
    supabase: SupabaseClient,
    workflow: { approval_type: string; config: Record<string, unknown> },
    timesheet: { organization_id: string; user_id: string }
): Promise<string[]> {
    const approvers: string[] = [];

    switch (workflow.approval_type) {
        case 'manager_hierarchy':
            // Get the employee's manager
            const { data: member } = await supabase
                .from('organization_members')
                .select('department_id')
                .eq('user_id', timesheet.user_id)
                .eq('organization_id', timesheet.organization_id)
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
            // Get users with specific role
            const roleId = (workflow.config as { approver_role_id?: string })?.approver_role_id;
            if (roleId) {
                const { data: roleMembers } = await supabase
                    .from('organization_members')
                    .select('user_id')
                    .eq('organization_id', timesheet.organization_id)
                    .eq('role_id', roleId);

                if (roleMembers) {
                    approvers.push(...roleMembers.map((m: { user_id: string }) => m.user_id));
                }
            }
            break;

        case 'single_approver':
            const approverId = (workflow.config as { approver_id?: string })?.approver_id;
            if (approverId) {
                approvers.push(approverId);
            }
            break;
    }

    return approvers;
}
