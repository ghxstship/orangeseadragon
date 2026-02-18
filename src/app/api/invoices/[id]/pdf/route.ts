import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';
import { NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, membership } = auth;

  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('id, invoice_number, total_amount')
      .eq('id', id)
      .eq('organization_id', membership.organization_id)
      .single();

    if (error) return error.code === 'PGRST116' ? notFound('Invoice') : supabaseError(error);

    const html = `<html><body><h1>Invoice ${data.invoice_number || id}</h1><p>Amount: ${data.total_amount || 0}</p></body></html>`;
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="invoice-${data.invoice_number || id}.html"`,
      },
    });
  } catch (err) {
    captureError(err, 'api.invoices.pdf.error');
    return serverError('Failed to generate invoice PDF');
  }
}
