import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * POST /api/crew-assignments/[id]/checkout
 * Check out a crew member and automatically generate/update timesheet entry
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

        const body = await request.json();
        const { notes } = body;

        // Get the crew assignment
        const { data: assignment, error: fetchError } = await supabase
            .from('crew_assignments')
            .select(`
        *,
        crew_call:crew_calls(*),
        crew_call_position:crew_call_positions(*)
      `)
            .eq('id', id)
            .single();

        if (fetchError || !assignment) {
            return notFound('Assignment');
        }

        // Validate assignment can be checked out
        if (assignment.status !== 'checked_in') {
            return badRequest(`Assignment with status '${assignment.status}' cannot be checked out`);
        }

        const checkoutTime = new Date();
        const checkinTime = new Date(assignment.checked_in_at);

        // Update assignment to checked out
        const { data: updatedAssignment, error: updateError } = await supabase
            .from('crew_assignments')
            .update({
                status: 'checked_out',
                checked_out_at: checkoutTime.toISOString(),
                notes: notes || assignment.notes,
                updated_at: checkoutTime.toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            return supabaseError(updateError);
        }

        // Calculate hours worked
        const hoursWorked = (checkoutTime.getTime() - checkinTime.getTime()) / (1000 * 60 * 60);
        const regularHours = Math.min(hoursWorked, 8);
        const overtimeHours = Math.max(0, hoursWorked - 8);

        // Find or create timesheet for this period
        const timesheetDate = new Date(assignment.crew_call.date);
        const periodStart = new Date(timesheetDate);
        periodStart.setDate(periodStart.getDate() - periodStart.getDay()); // Start of week
        const periodEnd = new Date(periodStart);
        periodEnd.setDate(periodEnd.getDate() + 6); // End of week

        let { data: timesheet } = await supabase
            .from('timesheets')
            .select('id, total_regular_hours, total_overtime_hours, total_amount')
            .eq('user_id', assignment.user_id)
            .eq('organization_id', assignment.organization_id)
            .gte('period_start', periodStart.toISOString().split('T')[0])
            .lte('period_end', periodEnd.toISOString().split('T')[0])
            .single();

        // Create timesheet if it doesn't exist
        if (!timesheet) {
            const { data: newTimesheet, error: timesheetError } = await supabase
                .from('timesheets')
                .insert({
                    organization_id: assignment.organization_id,
                    user_id: assignment.user_id,
                    period_start: periodStart.toISOString().split('T')[0],
                    period_end: periodEnd.toISOString().split('T')[0],
                    status: 'draft',
                    currency: assignment.currency || 'USD',
                })
                .select()
                .single();

            if (timesheetError) {
                captureError(timesheetError, 'api.crew-assignments.id.checkout.error');
            } else {
                timesheet = newTimesheet;
            }
        }

        // Create timesheet entry
        let timesheetEntry = null;
        if (timesheet) {
            const rate = assignment.rate_amount || assignment.crew_call_position?.rate_amount || 0;
            const totalAmount = (regularHours * rate) + (overtimeHours * rate * 1.5);

            const { data: entry, error: entryError } = await supabase
                .from('timesheet_entries')
                .insert({
                    timesheet_id: timesheet.id,
                    project_id: assignment.crew_call.project_id,
                    event_id: assignment.crew_call.event_id,
                    date: assignment.crew_call.date,
                    start_time: checkinTime.toTimeString().split(' ')[0],
                    end_time: checkoutTime.toTimeString().split(' ')[0],
                    break_minutes: 0,
                    regular_hours: regularHours,
                    overtime_hours: overtimeHours,
                    rate_type: assignment.rate_type || 'hourly',
                    rate_amount: rate,
                    total_amount: totalAmount,
                    description: `Crew call: ${assignment.crew_call.name}`,
                    is_billable: true,
                })
                .select()
                .single();

            if (!entryError) {
                timesheetEntry = entry;

                // Update timesheet totals
                await supabase
                    .from('timesheets')
                    .update({
                        total_regular_hours: (timesheet.total_regular_hours || 0) + regularHours,
                        total_overtime_hours: (timesheet.total_overtime_hours || 0) + overtimeHours,
                        total_amount: (timesheet.total_amount || 0) + totalAmount,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', timesheet.id);
            }
        }

        // Update shift if exists
        await supabase
            .from('shifts')
            .update({
                actual_end: checkoutTime.toTimeString().split(' ')[0],
                status: 'completed',
            })
            .eq('crew_assignment_id', id);

        // Audit log
        await supabase
            .from('audit_logs')
            .insert({
                organization_id: assignment.organization_id,
                user_id: user.id,
                action: 'crew_checkout',
                entity_type: 'crew_assignment',
                entity_id: id,
                old_values: { status: 'checked_in' },
                new_values: {
                    status: 'checked_out',
                    hours_worked: hoursWorked,
                    timesheet_entry_id: timesheetEntry?.id,
                },
            });

        return apiSuccess({
            assignment: updatedAssignment,
            timesheet_entry: timesheetEntry,
            hours_worked: {
                total: hoursWorked.toFixed(2),
                regular: regularHours.toFixed(2),
                overtime: overtimeHours.toFixed(2),
            },
        }, { message: 'Checked out and timesheet entry created' });
    } catch (e) {
        captureError(e, 'api.crew-assignments.id.checkout.error');
        return serverError('Checkout failed');
    }
}
