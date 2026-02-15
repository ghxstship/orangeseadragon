// /app/api/expense-approval-requests/approve/route.ts
// Approve an expense approval request

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, supabaseError, badRequest, serverError } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase, user } = auth;

  try {
    const { id } = await request.json();
    if (!id) return badRequest('id is required');

    const { error } = await supabase
      .from('expense_approval_requests')
      .update({
        status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) return supabaseError(error);

    return apiSuccess({ approved: true });
  } catch (err) {
    console.error('[Expense Approve] error:', err);
    return serverError('Failed to approve expense');
  }
}
