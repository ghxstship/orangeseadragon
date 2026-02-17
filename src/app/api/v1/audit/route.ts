import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiPaginated, badRequest, serverError } from '@/lib/api/response';
import { captureError, extractRequestContext } from '@/lib/observability';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export async function GET(request: NextRequest) {
  const ctx = extractRequestContext(request.headers);

  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const orgId = user.user_metadata?.organization_id;
    if (!orgId) return badRequest('Organization context required');

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || String(DEFAULT_PAGE), 10));
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10)));
    const action = searchParams.get('action');
    const category = searchParams.get('category');
    const severity = searchParams.get('severity');
    const actorId = searchParams.get('actorId');
    const targetType = searchParams.get('targetType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (action) query = query.eq('action', action);
    if (category) query = query.eq('category', category);
    if (severity) query = query.eq('severity', severity);
    if (actorId) query = query.eq('actor_id', actorId);
    if (targetType) query = query.eq('target_type', targetType);
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      if (error.code === '42P01') {
        return apiPaginated([], { page, limit, total: 0 });
      }
      captureError(error, 'v1.audit.query', ctx);
      return serverError('Failed to query audit logs');
    }

    const entries = (data ?? []).map((row) => ({
      id: row.id,
      action: row.action,
      category: row.category ?? 'general',
      severity: row.severity ?? 'info',
      actor: {
        id: row.actor_id ?? '',
        type: row.actor_type ?? 'user',
        name: row.actor_name ?? undefined,
        email: row.actor_email ?? undefined,
      },
      target: row.target_id
        ? {
            type: row.target_type ?? 'unknown',
            id: row.target_id,
            name: row.target_name ?? undefined,
          }
        : undefined,
      description: row.description ?? '',
      success: row.success !== false,
      timestamp: row.created_at,
      metadata: row.metadata ?? undefined,
    }));

    return apiPaginated(entries, { page, limit, total: count ?? 0 });
  } catch (err) {
    captureError(err, 'v1.audit.unhandled', ctx);
    return serverError('Internal server error');
  }
}
