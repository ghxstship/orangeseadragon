// /app/api/files/route.ts
// Files API for entity detail tabs — list attached files

import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;

  const entityId = request.nextUrl.searchParams.get('entityId');
  if (!entityId) {
    return apiSuccess({ items: [] });
  }

  try {
    const { data, error } = await supabase
      .from('file_attachments')
      .select('id, name, size, mime_type, url, uploaded_by_name, created_at')
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return supabaseError(error);
    }

    const items = (data || []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      name: row.name as string,
      size: (row.size as number) || 0,
      mimeType: (row.mime_type as string) || 'application/octet-stream',
      url: row.url as string,
      uploadedBy: (row.uploaded_by_name as string) || 'Unknown',
      uploadedAt: row.created_at as string,
    }));

    return apiSuccess({ items });
  } catch (err) {
    captureError(err, 'api.files.error');
    return serverError('Failed to fetch files');
  }
}
