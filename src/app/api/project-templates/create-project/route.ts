import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiCreated, badRequest, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * POST /api/project-templates/create-project
 * Create a new project from a template, cloning tasks and dependencies
 */
export async function POST(request: NextRequest) {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { user, supabase, membership } = auth;

    try {
        const body = await request.json();
        const { template_id, project_name, start_date, client_id } = body;

        if (!template_id || !project_name) {
            return badRequest('template_id and project_name are required');
        }

        // Call the DB function to create project from template
        const { data: projectId, error } = await supabase.rpc('create_project_from_template', {
            p_template_id: template_id,
            p_org_id: membership.organization_id,
            p_user_id: user.id,
            p_project_name: project_name,
            p_start_date: start_date || new Date().toISOString().split('T')[0],
            p_client_id: client_id || null,
        });

        if (error) {
            return supabaseError(error);
        }

        // Fetch the created project
        const { data: project } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();

        // Audit log
        await supabase
            .from('audit_logs')
            .insert({
                organization_id: membership.organization_id,
                user_id: user.id,
                action: 'project_created_from_template',
                entity_type: 'project',
                entity_id: projectId,
                new_values: {
                    template_id,
                    project_name,
                },
            });

        return apiCreated({ project, template_id });
    } catch (e) {
        captureError(e, 'api.project-templates.create-project.error');
        return serverError('Failed to create project from template');
    }
}
