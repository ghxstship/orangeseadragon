import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';

/**
 * POST /api/timer-sessions/[id]/stop
 * Stop a running timer session
 */
export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const auth = await requireAuth();
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

        if (!timer.is_running) {
            return badRequest('Timer is not running');
        }

        const resumedAt = timer.last_resumed_at || timer.started_at;
        const elapsed = Math.floor((Date.now() - new Date(resumedAt).getTime()) / 1000);
        const totalSeconds = (timer.accumulated_seconds || 0) + elapsed;

        const { data: updated, error } = await supabase
            .from('timer_sessions')
            .update({
                is_running: false,
                stopped_at: new Date().toISOString(),
                accumulated_seconds: totalSeconds,
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
        console.error('[API] Timer stop error:', e);
        return serverError('Failed to stop timer');
    }
}
