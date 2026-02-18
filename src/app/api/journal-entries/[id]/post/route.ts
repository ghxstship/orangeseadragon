import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requirePolicy('entity.write');
  if (auth.error) return auth.error;
  const { supabase, user, membership } = auth;

  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .update({ status: 'posted', posted_by: user.id, posted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('organization_id', membership.organization_id)
      .select()
      .single();

    if (error) return error.code === 'PGRST116' ? notFound('Journal entry') : supabaseError(error);
    return apiSuccess(data);
  } catch (err) {
    captureError(err, 'api.journal-entries.post.error');
    return serverError('Failed to post journal entry');
  }
}
