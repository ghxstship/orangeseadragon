import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';

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
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const { id: quoteId } = await params;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Stale Supabase types; function exists in migration 00086
    const { data, error } = await (supabase as any).rpc('convert_quote_to_invoice', {
      p_quote_id: quoteId,
      p_user_id: user.id,
    });

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess({ invoice_id: data });
  } catch (error) {
    console.error('Error converting quote to invoice:', error);
    return serverError();
  }
}
