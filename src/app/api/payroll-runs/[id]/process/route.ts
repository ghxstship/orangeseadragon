import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServiceClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Get the payroll run
    const { data: payrollRun, error: fetchError } = await supabase
      .from('payroll_runs')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !payrollRun) {
      return NextResponse.json({ error: 'Payroll run not found' }, { status: 404 });
    }

    if (payrollRun.status !== 'approved') {
      return NextResponse.json(
        { error: 'Payroll run must be approved before processing' },
        { status: 400 }
      );
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update all payroll items to paid
    await supabase
      .from('payroll_items')
      .update({ status: 'paid' })
      .eq('payroll_run_id', id);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error processing payroll run:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
