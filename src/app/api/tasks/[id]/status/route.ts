import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * POST /api/tasks/[id]/status
 * Update task status with dependency validation
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
        const { status: targetStatus, notes } = body;

        if (!targetStatus) {
            return badRequest('Target status is required');
        }

        // Get current task and its dependencies
        // Assuming task_dependencies table exists with (task_id, depends_on_task_id)
        const { data: task, error: fetchError } = await supabase
            .from('tasks')
            .select('*, dependencies:task_dependencies(depends_on_task_id)')
            .eq('id', id)
            .single();

        if (fetchError || !task) {
            return notFound('Task');
        }

        const currentStatus = task.status;

        // Dependency Enforcement: Cannot move to in_progress/done if dependencies are not done
        if (['in_progress', 'done'].includes(targetStatus)) {
            const dependencies = (task.dependencies ?? []) as Array<{ depends_on_task_id: string }>;
            const depIds = dependencies.map((d) => d.depends_on_task_id);
            if (depIds.length > 0) {
                const { data: openDeps, error: depError } = await supabase
                    .from('tasks')
                    .select('id, name, status')
                    .in('id', depIds)
                    .neq('status', 'done');

                if (depError) {
                    return serverError('Failed to check dependencies');
                }

                if (openDeps && openDeps.length > 0) {
                    return badRequest('Task is blocked by unfinished dependencies', { blocked_by: openDeps });
                }
            }
        }

        // Update task status
        const { data, error } = await supabase
            .from('tasks')
            .update({
                status: targetStatus,
                completed_at: targetStatus === 'done' ? new Date().toISOString() : task.completed_at,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return supabaseError(error);
        }

        // Audit Log
        await supabase
            .from('audit_logs')
            .insert({
                organization_id: task.organization_id,
                user_id: user.id,
                action: 'task_status_changed',
                entity_type: 'task',
                entity_id: id,
                old_values: { status: currentStatus },
                new_values: { status: targetStatus, notes: notes || null },
            });

        return apiSuccess(data, { message: `Task status updated to ${targetStatus}` });
    } catch (e) {
        captureError(e, 'api.tasks.id.status.error');
        return serverError('Failed to update task status');
    }
}
