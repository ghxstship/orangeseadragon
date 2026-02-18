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
    const { data: quote, error: fetchErr } = await supabase
      .from('quotes')
      .select('id, client_id, total_amount')
      .eq('id', id)
      .eq('organization_id', membership.organization_id)
      .single();

    if (fetchErr) return fetchErr.code === 'PGRST116' ? notFound('Quote') : supabaseError(fetchErr);

    const { data: invoice, error: insertErr } = await supabase
      .from('invoices')
      .insert({
        organization_id: membership.organization_id,
        company_id: quote.client_id,
        total_amount: quote.total_amount,
        status: 'draft',
        source_quote_id: id,
      })
      .select()
      .single();

    if (insertErr) return supabaseError(insertErr);

    await supabase
      .from('quotes')
      .update({ status: 'converted', convertedInvoiceId: invoice.id })
      .eq('id', id);

    return apiCreated(invoice);
  } catch (err) {
    captureError(err, 'api.quotes.convert.error');
    return serverError('Failed to convert quote to invoice');
  }
}
