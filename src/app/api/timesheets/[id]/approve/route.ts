import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';

/**
 * POST /api/timesheets/[id]/approve
 * Approve a submitted timesheet and update approval workflow
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
        const { comments } = body;

        // Get the timesheet
        const { data: timesheet, error: fetchError } = await supabase
            .from('timesheets')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !timesheet) {
            return notFound('Timesheet');
        }

        if (timesheet.status !== 'submitted') {
            return badRequest(`Timesheet with status '${timesheet.status}' cannot be approved`);
        }

        // Find any pending approval request
        const { data: approvalRequest } = await supabase
            .from('approval_requests')
            .select('*')
            .eq('entity_type', 'timesheet')
            .eq('entity_id', id)
            .eq('status', 'pending')
            .single();

        // Record the approval decision if workflow exists
        if (approvalRequest) {
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

            // Check if this was the final step
            const isFinalStep = approvalRequest.current_step >= approvalRequest.total_steps;

            if (isFinalStep) {
                // Mark approval request as complete
                await supabase
                    .from('approval_requests')
                    .update({
                        status: 'approved',
                        completed_at: new Date().toISOString(),
                    })
                    .eq('id', approvalRequest.id);
            } else {
                // Move to next step
                await supabase
                    .from('approval_requests')
                    .update({
                        current_step: approvalRequest.current_step + 1,
                    })
                    .eq('id', approvalRequest.id);
            }
        }

        // Update timesheet to approved
        const { data: updatedTimesheet, error: updateError } = await supabase
            .from('timesheets')
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

        // Notify the timesheet owner
        await supabase
            .from('notifications')
            .insert({
                organization_id: timesheet.organization_id,
                user_id: timesheet.user_id,
                type: 'timesheet_approved',
                title: 'Timesheet Approved',
                message: `Your timesheet has been approved`,
                data: { timesheet_id: id },
                entity_type: 'timesheet',
                entity_id: id,
            });

        // Create audit log
        await supabase
            .from('audit_logs')
            .insert({
                organization_id: timesheet.organization_id,
                user_id: user.id,
                action: 'timesheet_approved',
                entity_type: 'timesheet',
                entity_id: id,
                old_values: { status: 'submitted' },
                new_values: { status: 'approved' },
            });

        return apiSuccess(updatedTimesheet, { message: 'Timesheet approved' });
    } catch (e) {
        console.error('[API] Timesheet approve error:', e);
        return serverError('Approval failed');
    }
}
