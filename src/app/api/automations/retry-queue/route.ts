import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * GET /api/automations/retry-queue
 * List failed/retrying automation runs for the organization
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(['owner', 'admin', 'manager']);
    if (auth.error) return auth.error;
    const { supabase, membership } = auth;

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'failed';
    const automationType = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('automation_run_log')
      .select('*')
      .eq('organization_id', membership.organization_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status === 'all') {
      query = query.in('status', ['failed', 'retrying', 'dead_letter']);
    } else {
      query = query.eq('status', status);
    }

    if (automationType) {
      query = query.eq('automation_type', automationType);
    }

    const { data, error } = await query;

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(data || []);
  } catch (e) {
    captureError(e, 'api.automations.retry-queue.error');
    return serverError('Failed to list retry queue');
  }
}

/**
 * POST /api/automations/retry-queue
 * Retry a failed automation run, or move it to dead letter
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(['owner', 'admin', 'manager']);
    if (auth.error) return auth.error;
    const { user, supabase, membership } = auth;

    const body = await request.json();
    const { run_id, action } = body;

    if (!run_id) {
      return badRequest('run_id is required');
    }

    if (!action || !['retry', 'dead_letter', 'dismiss'].includes(action)) {
      return badRequest('action must be "retry", "dead_letter", or "dismiss"');
    }

    // Fetch the run
    const { data: run, error: fetchError } = await supabase
      .from('automation_run_log')
      .select('id, status, attempt_number, max_attempts')
      .eq('id', run_id)
      .eq('organization_id', membership.organization_id)
      .single();

    if (fetchError || !run) {
      return notFound('Automation run');
    }

    if (run.status === 'success') {
      return badRequest('Cannot retry a successful run');
    }

    let updateData: Record<string, unknown>;

    switch (action) {
      case 'retry':
        if (run.attempt_number >= run.max_attempts) {
          return badRequest('Maximum retry attempts reached. Move to dead letter or dismiss.');
        }
        updateData = {
          status: 'retrying',
          attempt_number: run.attempt_number + 1,
          next_retry_at: new Date(Date.now() + Math.pow(2, run.attempt_number) * 60 * 1000).toISOString(),
          error_message: null,
        };
        break;

      case 'dead_letter':
        updateData = {
          status: 'dead_letter',
          completed_at: new Date().toISOString(),
          next_retry_at: null,
        };
        break;

      case 'dismiss':
        updateData = {
          status: 'success',
          completed_at: new Date().toISOString(),
          next_retry_at: null,
          error_message: `Dismissed by ${user.email || user.id}`,
        };
        break;

      default:
        return badRequest('Invalid action');
    }

    const { data: updated, error: updateError } = await supabase
      .from('automation_run_log')
      .update(updateData)
      .eq('id', run_id)
      .select()
      .single();

    if (updateError) {
      return supabaseError(updateError);
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      organization_id: membership.organization_id,
      user_id: user.id,
      action: `automation_run_${action}`,
      entity_type: 'automation_run_log',
      entity_id: run_id,
      new_values: { action, attempt_number: updated.attempt_number },
    });

    return apiSuccess(updated, { action });
  } catch (e) {
    captureError(e, 'api.automations.retry-queue.error');
    return serverError('Failed to process retry action');
  }
}
