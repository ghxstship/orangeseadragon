import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * GET /api/invoices/[id]/payment-status
 * Returns payment details for a specific invoice (used by payment success page).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return badRequest('Invoice ID is required');
  }

  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        id,
        invoice_number,
        status,
        total,
        currency,
        paid_at,
        client:companies(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) return supabaseError(error);
    if (!invoice) return notFound('Invoice');

    const client = Array.isArray(invoice.client) ? invoice.client[0] : invoice.client;

    return apiSuccess({
      invoiceNumber: invoice.invoice_number,
      amount: invoice.total || 0,
      currency: invoice.currency || 'USD',
      clientName: client?.name || 'Unknown',
      paidAt: invoice.paid_at || new Date().toISOString(),
      status: invoice.status,
    });
  } catch (err) {
    captureError(err, 'api.invoices.id.payment-status.error');
    return serverError('Failed to fetch payment status');
  }
}
