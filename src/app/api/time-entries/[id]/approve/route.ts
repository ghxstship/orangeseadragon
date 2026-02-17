import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const { id } = await params;

    // Get the time entry
    const { data: timeEntry, error: fetchError } = await supabase
      .from('time_entries')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !timeEntry) {
      return notFound('Time entry');
    }

    if (timeEntry.status !== 'submitted') {
      return badRequest('Time entry is not submitted for approval');
    }

    // Get approver contact ID
    const { data: contact } = await supabase
      .from('contacts')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // Update time entry status
    const { data, error } = await supabase
      .from('time_entries')
      .update({
        status: 'approved',
        approved_by_id: contact?.id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(data);
  } catch (error) {
    captureError(error, 'api.time-entries.id.approve.error');
    return serverError('Failed to approve time entry');
  }
}
