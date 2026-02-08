import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';

/**
 * POST /api/finance/fiscal-periods/[id]/close
 * Close or lock a fiscal period — prevents further financial mutations
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const auth = await requireRole(['owner', 'admin', 'finance_manager']);
    if (auth.error) return auth.error;
    const { user, supabase, membership } = auth;

    const body = await request.json();
    const { action } = body;

    if (!action || !['close', 'lock', 'reopen'].includes(action)) {
      return badRequest('action must be "close", "lock", or "reopen"');
    }

    // Fetch fiscal period
    const { data: period, error: fetchError } = await supabase
      .from('fiscal_periods')
      .select('*')
      .eq('id', id)
      .eq('organization_id', membership.organization_id)
      .single();

    if (fetchError || !period) {
      return notFound('Fiscal period');
    }

    // Validate state transitions
    if (action === 'close' && period.status !== 'open') {
      return badRequest(`Cannot close a period that is ${period.status}`);
    }
    if (action === 'lock' && period.status !== 'closed') {
      return badRequest('Period must be closed before it can be locked');
    }
    if (action === 'reopen' && period.status === 'locked') {
      return badRequest('Locked periods cannot be reopened');
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (action === 'close') {
      updateData.status = 'closed';
      updateData.closed_at = new Date().toISOString();
      updateData.closed_by = user.id;
    } else if (action === 'lock') {
      updateData.status = 'locked';
      updateData.locked_at = new Date().toISOString();
      updateData.locked_by = user.id;
    } else if (action === 'reopen') {
      updateData.status = 'open';
      updateData.closed_at = null;
      updateData.closed_by = null;
    }

    const { data: updated, error: updateError } = await supabase
      .from('fiscal_periods')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return supabaseError(updateError);
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      organization_id: membership.organization_id,
      user_id: user.id,
      action: `fiscal_period_${action}`,
      entity_type: 'fiscal_period',
      entity_id: id,
      new_values: { status: updateData.status },
    });

    return apiSuccess(updated, { action });
  } catch (e) {
    console.error('[API] Fiscal period close error:', e);
    return serverError('Failed to update fiscal period');
  }
}
