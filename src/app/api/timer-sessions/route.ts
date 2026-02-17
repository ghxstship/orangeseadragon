import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, apiCreated, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * GET /api/timer-sessions
 * List timer sessions for the current user
 */
export async function GET(request: NextRequest) {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const searchParams = request.nextUrl.searchParams;
    const isRunning = searchParams.get('is_running');

    let query = supabase
        .from('timer_sessions')
        .select('*, project:projects(id, name), task:tasks(id, title)', { count: 'exact' })
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

    if (isRunning === 'true') {
        query = query.eq('is_running', true);
    } else if (isRunning === 'false') {
        query = query.eq('is_running', false);
    }

    const { data, error, count } = await query;

    if (error) {
        return supabaseError(error);
    }

    return apiSuccess(data, { total: count || 0 });
}

/**
 * POST /api/timer-sessions
 * Start a new timer session (stops any existing running timer first)
 */
export async function POST(request: NextRequest) {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { user, supabase, membership } = auth;

    try {
        const body = await request.json();
        const { project_id, task_id, event_id, description, is_billable = true } = body;

        // Stop any currently running timer
        const { data: runningTimer } = await supabase
            .from('timer_sessions')
            .select('id, started_at, accumulated_seconds, last_resumed_at')
            .eq('user_id', user.id)
            .eq('is_running', true)
            .maybeSingle();

        if (runningTimer) {
            const resumedAt = runningTimer.last_resumed_at || runningTimer.started_at;
            const elapsed = Math.floor((Date.now() - new Date(resumedAt).getTime()) / 1000);
            const totalSeconds = (runningTimer.accumulated_seconds || 0) + elapsed;

            await supabase
                .from('timer_sessions')
                .update({
                    is_running: false,
                    stopped_at: new Date().toISOString(),
                    accumulated_seconds: totalSeconds,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', runningTimer.id);
        }

        // Start new timer
        const { data: timer, error } = await supabase
            .from('timer_sessions')
            .insert({
                organization_id: membership.organization_id,
                user_id: user.id,
                project_id: project_id || null,
                task_id: task_id || null,
                event_id: event_id || null,
                description: description || null,
                is_billable,
                started_at: new Date().toISOString(),
                last_resumed_at: new Date().toISOString(),
                is_running: true,
                accumulated_seconds: 0,
            })
            .select('*, project:projects(id, name), task:tasks(id, title)')
            .single();

        if (error) {
            return supabaseError(error);
        }

        return apiCreated(timer, { stopped_previous: runningTimer?.id || null });
    } catch (e) {
        captureError(e, 'api.timer-sessions.error');
        return serverError('Failed to start timer');
    }
}
