import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * POST /api/quotes/:id/convert-to-invoice
 * 
 * One-click conversion of an accepted quote to a draft invoice.
 * Copies all line items and links the invoice back to the source quote.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const { id: quoteId } = await params;

    const { data, error } = await supabase.rpc('convert_quote_to_invoice', {
      p_quote_id: quoteId,
      p_user_id: user.id,
    });

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess({ invoice_id: data });
  } catch (error) {
    captureError(error, 'api.quotes.id.convert-to-invoice.error');
    return serverError('Failed to convert quote to invoice');
  }
}
