// /app/api/expense-approval-requests/route.ts
// Expense approval requests — list and create

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;

  const status = request.nextUrl.searchParams.get('status');
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '50'), 100);

  try {
    let query = supabase
      .from('expense_approval_requests')
      .select('*, expense:expenses(id, description, amount, currency, category)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) return supabaseError(error);

    return apiSuccess(data || []);
  } catch (err) {
    console.error('[Expense Approvals] GET error:', err);
    return serverError('Failed to fetch expense approval requests');
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase, user } = auth;

  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from('expense_approval_requests')
      .insert({
        ...body,
        requested_by: user.id,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) return supabaseError(error);

    return apiSuccess({ id: data.id });
  } catch (err) {
    console.error('[Expense Approvals] POST error:', err);
    return serverError('Failed to create expense approval request');
  }
}
