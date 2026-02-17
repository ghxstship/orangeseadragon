import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * Valid project status transitions
 */
const PROJECT_TRANSITIONS: Record<string, string[]> = {
    draft: ['planning', 'cancelled'],
    planning: ['active', 'draft', 'on_hold', 'cancelled'],
    active: ['completed', 'on_hold', 'cancelled'],
    on_hold: ['active', 'cancelled', 'completed'],
    completed: ['archived'],
    cancelled: ['draft'], // Allow restarting cancelled projects as draft
    archived: [],
};

/**
 * POST /api/projects/[id]/status
 * Update project status with transition validation
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

        // Get current project
        const { data: project, error: fetchError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !project) {
            return notFound('Project');
        }

        const currentStatus = project.status;

        // Validate transition
        const allowedTransitions = PROJECT_TRANSITIONS[currentStatus] || [];
        if (!allowedTransitions.includes(targetStatus)) {
            return badRequest(
                `Cannot transition from '${currentStatus}' to '${targetStatus}'`,
                { allowed_transitions: allowedTransitions }
            );
        }

        // Update project
        const { data, error } = await supabase
            .from('projects')
            .update({
                status: targetStatus,
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
                organization_id: project.organization_id,
                user_id: user.id,
                action: 'project_status_changed',
                entity_type: 'project',
                entity_id: id,
                old_values: { status: currentStatus },
                new_values: { status: targetStatus, notes: notes || null },
            });

        return apiSuccess(data, { message: `Project transitioned to ${targetStatus}` });
    } catch (e) {
        captureError(e, 'api.projects.id.status.error');
        return serverError('Failed to update project status');
    }
}
