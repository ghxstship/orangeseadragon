import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * POST /api/timer-sessions/[id]/convert
 * Convert a stopped timer session into a time entry
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    try {
        const body = await request.json().catch(() => ({}));
        const { description: overrideDescription, project_id: overrideProject, task_id: overrideTask } = body;

        const { data: timer } = await supabase
            .from('timer_sessions')
            .select('id, is_running, time_entry_id, accumulated_seconds, organization_id, project_id, task_id, event_id, description, started_at, stopped_at, is_billable')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (!timer) {
            return notFound('Timer');
        }

        if (timer.is_running) {
            return badRequest('Stop the timer before converting');
        }

        if (timer.time_entry_id) {
            return badRequest('Timer already converted');
        }

        const totalSeconds = timer.accumulated_seconds || 0;
        const hours = Math.round((totalSeconds / 3600) * 100) / 100;

        // Create time entry
        const { data: timeEntry, error: entryError } = await supabase
            .from('time_entries')
            .insert({
                organization_id: timer.organization_id,
                user_id: user.id,
                project_id: overrideProject || timer.project_id,
                task_id: overrideTask || timer.task_id,
                event_id: timer.event_id,
                description: overrideDescription || timer.description || 'Timer entry',
                date: new Date(timer.started_at).toISOString().split('T')[0],
                start_time: timer.started_at,
                end_time: timer.stopped_at,
                duration_hours: hours,
                is_billable: timer.is_billable,
                entry_type: 'timer',
                created_by: user.id,
            })
            .select()
            .single();

        if (entryError) {
            return supabaseError(entryError);
        }

        // Link timer to time entry
        await supabase
            .from('timer_sessions')
            .update({
                time_entry_id: timeEntry.id,
                converted_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);

        return apiSuccess({
            time_entry: timeEntry,
            timer_id: id,
            duration_hours: hours,
        });
    } catch (e) {
        captureError(e, 'api.timer-sessions.id.convert.error');
        return serverError('Failed to convert timer');
    }
}
