// /app/api/expense-approval-requests/return/route.ts
// Return an expense approval request for revision

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
        status: 'returned',
        returned_by: user.id,
        returned_at: new Date().toISOString(),
        return_reason: reason || null,
      })
      .eq('id', id);

    if (error) return supabaseError(error);

    return apiSuccess({ returned: true });
  } catch (err) {
    console.error('[Expense Return] error:', err);
    return serverError('Failed to return expense');
  }
}
