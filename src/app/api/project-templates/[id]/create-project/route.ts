import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiCreated, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requirePolicy('entity.write');
  if (auth.error) return auth.error;
  const { supabase, membership } = auth;

  try {
    const { data: template, error: fetchErr } = await supabase
      .from('project_templates')
      .select('id, name, production_type, usage_count')
      .eq('id', id)
      .eq('organization_id', membership.organization_id)
      .single();

    if (fetchErr) return fetchErr.code === 'PGRST116' ? notFound('Project template') : supabaseError(fetchErr);

    const { data: project, error: insertErr } = await supabase
      .from('projects')
      .insert({
        organization_id: membership.organization_id,
        name: `${template.name} - New Project`,
        production_type: template.production_type,
        status: 'planning',
        template_id: id,
      })
      .select()
      .single();

    if (insertErr) return supabaseError(insertErr);

    await supabase
      .from('project_templates')
      .update({ usage_count: (template.usage_count || 0) + 1 })
      .eq('id', id);

    return apiCreated(project);
  } catch (err) {
    captureError(err, 'api.project-templates.create-project.error');
    return serverError('Failed to create project from template');
  }
}
