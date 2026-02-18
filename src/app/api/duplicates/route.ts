import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, membership } = auth;

  try {
    const { searchParams } = request.nextUrl;
    const entityType = searchParams.get('entity_type');
    const status = searchParams.get('status') || 'pending';

    if (!entityType || !['contact', 'company'].includes(entityType)) {
      return badRequest('entity_type must be "contact" or "company"');
    }

    const tableName = entityType === 'contact' ? 'contacts' : 'companies';

    const { data, error } = await supabase
      .from(tableName)
      .select('id, name, email, created_at')
      .eq('organization_id', membership.organization_id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) return supabaseError(error);

    const records = data || [];
    const duplicates: Array<{
      id: string;
      entity_type: string;
      status: string;
      records: typeof records;
      match_field: string;
      match_value: string;
    }> = [];

    const emailGroups = new Map<string, typeof records>();
    for (const record of records) {
      const key = (record.email || record.name || '').toLowerCase().trim();
      if (!key) continue;
      const group = emailGroups.get(key) || [];
      group.push(record);
      emailGroups.set(key, group);
    }

    for (const [key, group] of emailGroups) {
      if (group.length > 1) {
        const first = group[0]!;
        duplicates.push({
          id: first.id,
          entity_type: entityType,
          status,
          records: group,
          match_field: first.email ? 'email' : 'name',
          match_value: key,
        });
      }
    }

    return apiSuccess(duplicates);
  } catch (err) {
    captureError(err, 'api.duplicates.error');
    return serverError('Failed to detect duplicates');
  }
}
