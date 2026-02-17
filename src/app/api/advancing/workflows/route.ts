import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, supabaseError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;
  const searchParams = request.nextUrl.searchParams;
  
  const workflowType = searchParams.get('workflowType');
  const triggerType = searchParams.get('triggerType');
  const entityType = searchParams.get('entityType');
  const isActive = searchParams.get('isActive');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '25');
  
  let query = supabase
    .from('workflows')
    .select(`
      *,
      creator:users!workflows_created_by_fkey(id, full_name)
    `, { count: 'exact' });
  
  if (workflowType) query = query.eq('workflow_type', workflowType);
  if (triggerType) query = query.eq('trigger_type', triggerType);
  if (entityType) query = query.eq('entity_type', entityType);
  if (isActive !== null && isActive !== undefined) {
    query = query.eq('is_active', isActive === 'true');
  }
  
  query = query
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  
  const { data, error, count } = await query;
  
  if (error) {
    return supabaseError(error);
  }
  
  return apiSuccess({
    records: data || [],
    total: count || 0,
    page,
    pageSize,
  });
}

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { user, supabase } = auth;
  
  try {
    const body = await request.json();
    const { 
      name, 
      description,
      slug,
      workflowType, 
      triggerType, 
      triggerConfig,
      entityType,
      steps,
      isActive,
      runOncePerEntity,
      maxRetries,
      retryDelayMinutes
    } = body;
    
    if (!name || !workflowType || !triggerType) {
      return badRequest('name, workflowType, and triggerType are required');
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
    
    const { data, error } = await supabase
      .from('workflows')
      .insert({
        organization_id: userOrg.organization_id,
        name,
        description,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        workflow_type: workflowType,
        trigger_type: triggerType,
        trigger_config: triggerConfig || {},
        entity_type: entityType,
        steps: steps || [],
        is_active: isActive !== false,
        run_once_per_entity: runOncePerEntity || false,
        max_retries: maxRetries || 3,
        retry_delay_minutes: retryDelayMinutes || 5,
        created_by: userId,
      })
      .select()
      .single();
    
    if (error) {
      return supabaseError(error);
    }
    
    return apiCreated(data);
  } catch {
    return badRequest('Invalid request body');
  }
}
