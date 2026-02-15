// /app/api/expense-approval-requests/bulk-approve/route.ts
// Bulk approve multiple expense approval requests

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, supabaseError, badRequest, serverError } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase, user } = auth;

  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return badRequest('ids array is required');
    }

    const { error } = await supabase
      .from('expense_approval_requests')
      .update({
        status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      })
      .in('id', ids);

    if (error) return supabaseError(error);

    return apiSuccess({ approved: ids.length });
  } catch (err) {
    console.error('[Expense Bulk Approve] error:', err);
    return serverError('Failed to bulk approve expenses');
  }
}
