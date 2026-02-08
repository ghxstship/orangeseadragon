import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, notFound, supabaseError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;
  const searchParams = request.nextUrl.searchParams;
  
  const category = searchParams.get('category');
  const workflowType = searchParams.get('workflowType');
  
  let query = supabase
    .from('workflow_templates')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });
  
  if (category) query = query.eq('category', category);
  if (workflowType) query = query.eq('workflow_type', workflowType);
  
  const { data, error } = await query;
  
  if (error) {
    return supabaseError(error);
  }
  
  return apiSuccess(data || []);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;
  
  try {
    const body = await request.json();
    const { templateId, name, variables } = body;
    
    if (!templateId) {
      return badRequest('templateId is required');
    }
    
    // Get the template
    const { data: template, error: templateError } = await supabase
      .from('workflow_templates')
      .select('*')
      .eq('id', templateId)
      .single();
    
    if (templateError || !template) {
      return notFound('Template not found');
    }
    
    const userId = user.id;
    
    // Get organization from current user
    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', userId)
      .single();
    
    if (!userOrg) {
      return badRequest('User organization not found');
    }
    
    // Apply variables to template
    let triggerConfig = JSON.stringify(template.trigger_config_template);
    let steps = JSON.stringify(template.steps_template);
    
    if (variables) {
      for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`;
        triggerConfig = triggerConfig.replace(new RegExp(placeholder, 'g'), String(value));
        steps = steps.replace(new RegExp(placeholder, 'g'), String(value));
      }
    }
    
    // Create workflow from template
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .insert({
        organization_id: userOrg.organization_id,
        name: name || template.name,
        description: template.description,
        slug: (name || template.name).toLowerCase().replace(/\s+/g, '-'),
        workflow_type: template.workflow_type,
        trigger_type: template.trigger_type,
        trigger_config: JSON.parse(triggerConfig),
        steps: JSON.parse(steps),
        is_active: true,
        created_by: userId,
      })
      .select()
      .single();
    
    if (workflowError) {
      return supabaseError(workflowError);
    }
    
    return apiCreated(workflow);
  } catch {
    return badRequest('Invalid request body');
  }
}
