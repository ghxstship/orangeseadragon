import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * POST /api/timer-sessions/[id]/resume
 * Resume a stopped timer session
 */
export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    try {
        const { data: timer } = await supabase
            .from('timer_sessions')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (!timer) {
            return notFound('Timer');
        }

        if (timer.is_running) {
            return badRequest('Timer is already running');
        }

        if (timer.time_entry_id) {
            return badRequest('Timer has already been converted to a time entry');
        }

        // Stop any other running timer first
        await supabase
            .from('timer_sessions')
            .update({
                is_running: false,
                stopped_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id)
            .eq('is_running', true)
            .neq('id', id);

        const { data: updated, error } = await supabase
            .from('timer_sessions')
            .update({
                is_running: true,
                last_resumed_at: new Date().toISOString(),
                stopped_at: null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return supabaseError(error);
        }

        return apiSuccess(updated);
    } catch (e) {
        captureError(e, 'api.timer-sessions.id.resume.error');
        return serverError('Failed to resume timer');
    }
}
