// /app/api/expense-approval-requests/approve/route.ts
// Approve an expense approval request

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
    const comments = resolveApprovalComments(payload);

    // Use canonical workflow function to keep expense/request/action state consistent.
    const { error } = await supabase.rpc('process_expense_approval', {
      p_request_id: approvalRequestId,
      p_action: 'approved',
      p_comments: comments || null,
    });

    if (error) return supabaseError(error);

    return apiSuccess({ approved: true });
  } catch (err) {
    captureError(err, 'api.expense-approval-requests.approve.error');
    return serverError('Failed to approve expense');
  }
}
