// /app/api/expense-approval-requests/reject/route.ts
// Reject an expense approval request

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, supabaseError, badRequest, serverError } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase, user } = auth;

  try {
    const { id, reason } = await request.json();
    if (!id) return badRequest('id is required');

    const { error } = await supabase
      .from('expense_approval_requests')
      .update({
        status: 'rejected',
        rejected_by: user.id,
        rejected_at: new Date().toISOString(),
        rejection_reason: reason || null,
      })
      .eq('id', id);

    if (error) return supabaseError(error);

    return apiSuccess({ rejected: true });
  } catch (err) {
    console.error('[Expense Reject] error:', err);
    return serverError('Failed to reject expense');
  }
}
