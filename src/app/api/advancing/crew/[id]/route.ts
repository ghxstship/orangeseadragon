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
    .from('crew_members')
    .select(`
      *,
      user:users(id, full_name, email, avatar_url)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return notFound('Crew member not found');
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
      'full_name', 'email', 'phone', 'avatar_url', 'skills', 
      'certifications', 'equipment_trained', 'hourly_rate', 'day_rate',
      'overtime_multiplier', 'currency', 'default_availability', 
      'rating', 'status', 'notes'
    ];
    
    for (const field of allowedFields) {
      const camelField = field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      if (body[camelField] !== undefined) {
        updateData[field] = body[camelField];
      } else if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }
    
    const { data, error } = await supabase
      .from('crew_members')
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
    .from('crew_members')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    return supabaseError(error);
  }
  
  return apiSuccess(data, { message: 'Crew member archived' });
}
