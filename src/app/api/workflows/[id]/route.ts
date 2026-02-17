import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, supabaseError, notFound } from '@/lib/api/response';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;

  const { data, error } = await supabase
    .from('workflow_templates')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error) return supabaseError(error);
  if (!data) return notFound('Workflow not found');

  return apiSuccess(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requirePolicy('entity.write');
  if (auth.error) return auth.error;
  const { supabase } = auth;

  try {
    const body = await request.json();
    const { name, description, trigger, nodes, edges, is_active } = body;

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (trigger !== undefined) {
      updates.trigger_type = trigger.type;
      updates.trigger_config = trigger.config || {};
    }
    if (nodes !== undefined || edges !== undefined) {
      updates.metadata = { visual_builder: true, nodes, edges };
    }
    if (is_active !== undefined) {
      updates.status = is_active ? 'active' : 'draft';
    }

    const { data, error } = await supabase
      .from('workflow_templates')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (error) return supabaseError(error);
    if (!data) return notFound('Workflow not found');

    return apiSuccess(data);
  } catch {
    return badRequest('Invalid request body');
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requirePolicy('entity.write');
  if (auth.error) return auth.error;
  const { supabase } = auth;

  const { error } = await supabase
    .from('workflow_templates')
    .delete()
    .eq('id', params.id);

  if (error) return supabaseError(error);

  return apiSuccess({ deleted: true });
}
