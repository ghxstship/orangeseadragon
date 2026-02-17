// /app/api/expense-approval-requests/bulk-approve/route.ts
// Bulk approve multiple expense approval requests

import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError, badRequest, serverError } from '@/lib/api/response';
import { resolveApprovalRequestIds } from '@/lib/expense-approvals/action-payload';
import { captureError } from '@/lib/observability';

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;

  try {
    const payload = await request.json();
    const approvalRequestIds = resolveApprovalRequestIds(payload);

    if (approvalRequestIds.length === 0) {
      return badRequest('ids array is required');
    }

    // Use canonical workflow function to keep expense/request/action state consistent.
    for (const requestId of approvalRequestIds) {
      const { error } = await supabase.rpc('process_expense_approval', {
        p_request_id: requestId,
        p_action: 'approved',
        p_comments: null,
      });

      if (error) return supabaseError(error);
    }

    return apiSuccess({ approved: approvalRequestIds.length });
  } catch (err) {
    captureError(err, 'api.expense-approval-requests.bulk-approve.error');
    return serverError('Failed to bulk approve expenses');
  }
}
