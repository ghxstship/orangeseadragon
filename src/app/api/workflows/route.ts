import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, supabaseError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;
  const searchParams = request.nextUrl.searchParams;

  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '25');

  let query = supabase
    .from('workflow_templates')
    .select('*', { count: 'exact' });

  if (status) query = query.eq('status', status);
  if (search) query = query.ilike('name', `%${search}%`);

  query = query
    .order('updated_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error, count } = await query;

  if (error) return supabaseError(error);

  return apiSuccess({
    records: data || [],
    total: count || 0,
    page,
    pageSize,
  });
}

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.write');
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  try {
    const body = await request.json();
    const { name, description, trigger, nodes, edges, is_active } = body;

    if (!name?.trim()) {
      return badRequest('Workflow name is required');
    }

    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!userOrg) return badRequest('User organization not found');

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const { data, error } = await supabase
      .from('workflow_templates')
      .insert({
        organization_id: userOrg.organization_id,
        name,
        description: description || null,
        slug,
        trigger_type: trigger?.type || 'manual',
        trigger_config: trigger?.config || {},
        variables: null,
        metadata: { visual_builder: true, nodes, edges },
        status: is_active ? 'active' : 'draft',
        version: 1,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) return supabaseError(error);

    return apiCreated(data);
  } catch {
    return badRequest('Invalid request body');
  }
}
