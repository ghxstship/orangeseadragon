import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError } from '@/lib/api/response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;
  const { id } = await params;
  
  const { data, error } = await supabase
    .from('workflows')
    .select(`
      *,
      creator:users!workflows_created_by_fkey(id, full_name)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return notFound('Workflow not found');
    }
    return supabaseError(error);
  }
  
  return apiSuccess(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;
  const { id } = await params;
  
  try {
    const body = await request.json();
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    
    const allowedFields = [
      'name', 'description', 'slug', 'workflow_type', 'trigger_type',
      'trigger_config', 'entity_type', 'steps', 'is_active',
      'run_once_per_entity', 'max_retries', 'retry_delay_minutes'
    ];
    
    for (const field of allowedFields) {
      const camelField = field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      if (body[camelField] !== undefined) {
        updateData[field] = body[camelField];
      } else if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }
    
    // Increment version if steps changed
    if (updateData.steps) {
      const { data: current } = await supabase
        .from('workflows')
        .select('version')
        .eq('id', id)
        .single();
      
      updateData.version = (current?.version || 0) + 1;
    }
    
    const { data, error } = await supabase
      .from('workflows')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return supabaseError(error);
    }
    
    return apiSuccess(data);
  } catch {
    return badRequest('Invalid request body');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;
  const { id } = await params;
  
  const { data, error } = await supabase
    .from('workflows')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    return supabaseError(error);
  }
  
  return apiSuccess(data, { message: 'Workflow archived' });
}
