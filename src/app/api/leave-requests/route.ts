import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * GET /api/leave-requests
 * List leave requests for the current user's organization.
 */
export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, membership } = auth;

  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const leaveTypeId = searchParams.get('leaveTypeId');

    const orgId = membership.organization_id;

    let query = supabase
      .from('leave_requests')
      .select(`
        id,
        user_id,
        leave_type_id,
        start_date,
        end_date,
        half_day_start,
        half_day_end,
        total_days,
        reason,
        status,
        approved_by,
        approved_at,
        created_at,
        updated_at,
        leave_type:leave_types(id, name, color),
        requester:users!leave_requests_user_id_fkey(id, full_name, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (orgId) {
      query = query.eq('organization_id', orgId);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (leaveTypeId) {
      query = query.eq('leave_type_id', leaveTypeId);
    }

    const { data, error } = await query;
    if (error) return supabaseError(error);

    return apiSuccess(data || []);
  } catch (err) {
    captureError(err, 'api.leave-requests.error');
    return serverError('Failed to fetch leave requests');
  }
}

/**
 * POST /api/leave-requests
 * Submit a new leave request.
 */
export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { user, supabase, membership } = auth;

  try {
    const body = await request.json();
    const {
      leave_type_id,
      start_date,
      end_date,
      half_day_start,
      half_day_end,
      reason,
      attachment_url,
    } = body;

    if (!leave_type_id) {
      return badRequest('leave_type_id is required');
    }
    if (!start_date || !end_date) {
      return badRequest('start_date and end_date are required');
    }

    const orgId = membership.organization_id;
    if (!orgId) return badRequest('User has no organization');

    // Calculate total days (simple business-day approximation)
    const start = new Date(start_date);
    const end = new Date(end_date);
    let totalDays = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) totalDays++;
      current.setDate(current.getDate() + 1);
    }

    // Adjust for half days
    if (half_day_start && totalDays > 0) totalDays -= 0.5;
    if (half_day_end && totalDays > 0) totalDays -= 0.5;

    const { data, error } = await supabase
      .from('leave_requests')
      .insert({
        user_id: user.id,
        organization_id: orgId,
        leave_type_id,
        start_date,
        end_date,
        half_day_start: half_day_start || false,
        half_day_end: half_day_end || false,
        total_days: totalDays,
        reason: reason || null,
        attachment_url: attachment_url || null,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return supabaseError(error);

    return apiCreated(data);
  } catch (err) {
    captureError(err, 'api.leave-requests.error');
    return serverError('Failed to create leave request');
  }
}
