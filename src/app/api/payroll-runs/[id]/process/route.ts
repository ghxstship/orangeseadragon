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
    const { supabase } = auth;

    const { id } = params;

    // Get the payroll run
    const { data: payrollRun, error: fetchError } = await supabase
      .from('payroll_runs')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !payrollRun) {
      return notFound('Payroll run');
    }

    if (payrollRun.status !== 'approved') {
      return badRequest('Payroll run must be approved before processing');
    }

    // Update payroll run status to paid
    const { data, error } = await supabase
      .from('payroll_runs')
      .update({
        status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return supabaseError(error);
    }

    // Update all payroll items to paid
    await supabase
      .from('payroll_items')
      .update({ status: 'paid' })
      .eq('payroll_run_id', id);

    return apiSuccess(data);
  } catch (error) {
    console.error('Error processing payroll run:', error);
    return serverError();
  }
}
