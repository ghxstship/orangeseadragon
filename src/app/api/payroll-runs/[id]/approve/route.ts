import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const { id } = await params;

    // Get the payroll run
    const { data: payrollRun, error: fetchError } = await supabase
      .from('payroll_runs')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !payrollRun) {
      return notFound('Payroll run');
    }

    if (payrollRun.status !== 'pending_approval') {
      return badRequest('Payroll run is not pending approval');
    }

    // Get approver contact ID
    const { data: contact } = await supabase
      .from('contacts')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // Update payroll run status
    const { data, error } = await supabase
      .from('payroll_runs')
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
    console.error('Error approving payroll run:', error);
    return serverError();
  }
}
