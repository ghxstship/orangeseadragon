// /app/api/projects/[id]/call-sheet/route.ts
// Call sheet API — save and retrieve call sheet data for a project

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, supabaseError, badRequest, serverError } from '@/lib/api/response';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;
  const { id: projectId } = await params;

  if (!projectId) return badRequest('projectId is required');

  try {
    const { data, error } = await supabase
      .from('call_sheets')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) return supabaseError(error);

    return apiSuccess(data);
  } catch (err) {
    console.error('[Call Sheet] GET error:', err);
    return serverError('Failed to fetch call sheet');
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase, user } = auth;
  const { id: projectId } = await params;

  if (!projectId) return badRequest('projectId is required');

  try {
    const body = await request.json();
    const { productionInfo, contacts, departmentCalls, schedule } = body;

    // Upsert call sheet data — one call sheet per project
    const { data, error } = await supabase
      .from('call_sheets')
      .upsert({
        project_id: projectId,
        production_info: productionInfo,
        contacts,
        department_calls: departmentCalls,
        schedule,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'project_id' })
      .select('id')
      .single();

    if (error) return supabaseError(error);

    return apiSuccess({ id: data.id, saved: true });
  } catch (err) {
    console.error('[Call Sheet] POST error:', err);
    return serverError('Failed to save call sheet');
  }
}
