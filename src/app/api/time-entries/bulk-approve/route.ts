import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, supabaseError, serverError } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return badRequest('No time entry IDs provided');
    }

    // Get approver contact ID
    const { data: contact } = await supabase
      .from('contacts')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // Update all time entries
    const { data, error } = await supabase
      .from('time_entries')
      .update({
        status: 'approved',
        approved_by_id: contact?.id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .in('id', ids)
      .eq('status', 'submitted')
      .select();

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(data, { approved_count: data?.length || 0 });
  } catch (error) {
    console.error('Error bulk approving time entries:', error);
    return serverError();
  }
}
