// /app/api/expense-approval-requests/return/route.ts
// Return an expense approval request for revision

import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError, badRequest, serverError } from '@/lib/api/response';
import { resolveApprovalComments, resolveApprovalRequestId } from '@/lib/expense-approvals/action-payload';
import { captureError } from '@/lib/observability';

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;

  try {
    const payload = await request.json();
    const approvalRequestId = resolveApprovalRequestId(payload);
    if (!approvalRequestId) return badRequest('id is required');
    const returnReason = resolveApprovalComments(payload);

    // Use canonical workflow function to keep expense/request/action state consistent.
    const { error } = await supabase.rpc('process_expense_approval', {
      p_request_id: approvalRequestId,
      p_action: 'returned',
      p_comments: returnReason,
    });

    if (error) return supabaseError(error);

    return apiSuccess({ returned: true, status: 'cancelled' });
  } catch (err) {
    captureError(err, 'api.expense-approval-requests.return.error');
    return serverError('Failed to return expense');
  }
}
