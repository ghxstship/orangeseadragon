// /app/api/expense-approval-requests/route.ts
// Expense approval requests — list and create

import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;

  const status = request.nextUrl.searchParams.get('status');
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '50'), 100);

  try {
    let query = supabase
      .from('expense_approval_requests')
      .select('*, policy:expense_approval_policies(approval_levels), expense:expenses(id, description, amount, currency, category, expense_date, receipt_url)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) return supabaseError(error);

    return apiSuccess(data || []);
  } catch (err) {
    captureError(err, 'api.expense-approval-requests.error');
    return serverError('Failed to fetch expense approval requests');
  }
}

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, user } = auth;

  try {
    const body = await request.json();
    const {
      requested_by: _legacyRequestedBy,
      submitted_by: _submittedBy,
      status: _ignoredStatus,
      ...requestPayload
    } = (body || {}) as Record<string, unknown>;

    const { data, error } = await supabase
      .from('expense_approval_requests')
      .insert({
        ...requestPayload,
        submitted_by: user.id,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) return supabaseError(error);

    return apiSuccess({ id: data.id });
  } catch (err) {
    captureError(err, 'api.expense-approval-requests.error');
    return serverError('Failed to create expense approval request');
  }
}
