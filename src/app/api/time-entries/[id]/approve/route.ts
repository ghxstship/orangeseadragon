import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const { id } = params;

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
    console.error('Error approving time entry:', error);
    return serverError();
  }
}
