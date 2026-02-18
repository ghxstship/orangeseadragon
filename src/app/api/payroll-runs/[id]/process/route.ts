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
    const { supabase } = auth;

    const { id } = await params;

    // Get the payroll run
    const { data: payrollRun, error: fetchError } = await supabase
      .from('payroll_runs')
      .select('id, status')
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
    captureError(error, 'api.payroll-runs.id.process.error');
    return serverError('Failed to process payroll run');
  }
}
