import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';

/**
 * POST /api/members/[id]/status
 * Update organization member status (invited, active, suspended, deactivated)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;
        const { user, supabase } = auth;

        const body = await request.json();
        const { status: targetStatus, reason } = body;

        const VALID_STATUSES = ['invited', 'active', 'suspended', 'deactivated'];
        if (!targetStatus || !VALID_STATUSES.includes(targetStatus)) {
            return badRequest('Invalid status', { valid_statuses: VALID_STATUSES });
        }

        // Get current member record
        const { data: member, error: fetchError } = await supabase
            .from('organization_members')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !member) {
            return notFound('Member');
        }

        // TODO: Add permission check (only admins/owners can change status)

        // Update status
        const { data, error } = await supabase
            .from('organization_members')
            .update({
                status: targetStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return supabaseError(error);
        }

        // Audit Log
        await supabase
            .from('audit_logs')
            .insert({
                organization_id: member.organization_id,
                user_id: user.id,
                action: 'member_status_changed',
                entity_type: 'organization_member',
                entity_id: id,
                old_values: { status: member.status },
                new_values: { status: targetStatus, reason: reason || null },
            });

        return apiSuccess(data, { message: `Member status updated to ${targetStatus}` });
    } catch (e) {
        console.error('[API] Member status update error:', e);
        return serverError('Failed to update member status');
    }
}
