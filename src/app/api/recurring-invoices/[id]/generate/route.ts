import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiCreated, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requirePolicy('entity.write');
  if (auth.error) return auth.error;
  const { supabase, membership } = auth;

  try {
    const { data: template, error: fetchErr } = await supabase
      .from('recurring_invoices')
      .select('*')
      .eq('id', id)
      .eq('organization_id', membership.organization_id)
      .single();

    if (fetchErr) return fetchErr.code === 'PGRST116' ? notFound('Recurring invoice') : supabaseError(fetchErr);

    const { data: invoice, error: insertErr } = await supabase
      .from('invoices')
      .insert({
        organization_id: membership.organization_id,
        company_id: template.client_id || template.company_id,
        total_amount: template.amount || template.total_amount,
        status: 'draft',
        recurring_invoice_id: id,
      })
      .select()
      .single();

    if (insertErr) return supabaseError(insertErr);

    await supabase
      .from('recurring_invoices')
      .update({ last_generated_at: new Date().toISOString() })
      .eq('id', id);

    return apiCreated(invoice);
  } catch (err) {
    captureError(err, 'api.recurring-invoices.generate.error');
    return serverError('Failed to generate invoice');
  }
}
