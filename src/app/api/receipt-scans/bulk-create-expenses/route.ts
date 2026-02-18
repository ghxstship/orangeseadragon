import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.write');
  if (auth.error) return auth.error;
  const { supabase, membership } = auth;

  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) return badRequest('ids array is required');

    const { data: scans, error: fetchErr } = await supabase
      .from('receipt_scans')
      .select('id, extracted_vendor, extracted_amount')
      .in('id', ids)
      .eq('organization_id', membership.organization_id)
      .eq('status', 'completed')
      .is('expenseId', null);

    if (fetchErr) return supabaseError(fetchErr);
    if (!scans?.length) return badRequest('No eligible receipt scans found');

    const expenses = scans.map(scan => ({
      organization_id: membership.organization_id,
      vendor: scan.extracted_vendor,
      amount: scan.extracted_amount,
      receipt_scan_id: scan.id,
      status: 'draft',
    }));

    const { data, error } = await supabase
      .from('expenses')
      .insert(expenses)
      .select('id');

    if (error) return supabaseError(error);
    return apiSuccess({ created: data?.length || 0 });
  } catch (err) {
    captureError(err, 'api.receipt-scans.bulk-create-expenses.error');
    return serverError('Failed to create expenses from receipts');
  }
}
