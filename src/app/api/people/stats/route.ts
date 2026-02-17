import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function GET() {
  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { supabase, membership } = auth;

    const orgId = membership.organization_id;
    if (!orgId) {
      return apiSuccess({ totalStaff: 0, availableNow: 0, onAssignment: 0, pendingOnboard: 0 });
    }

    const [membersRes, assignmentsRes, pendingRes] = await Promise.all([
      supabase
        .from('organization_members')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('status', 'active'),
      supabase
        .from('task_assignments')
        .select('user_id', { count: 'exact', head: true })
        .not('completed_at', 'is', null),
      supabase
        .from('organization_members')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('status', 'pending'),
    ]);

    const totalStaff = membersRes.count ?? 0;
    const onAssignment = assignmentsRes.count ?? 0;
    const pendingOnboard = pendingRes.count ?? 0;
    const availableNow = Math.max(0, totalStaff - onAssignment);

    return apiSuccess({ totalStaff, availableNow, onAssignment, pendingOnboard });
  } catch (error) {
    captureError(error, 'api.people.stats.error');
    return serverError('Failed to load people statistics');
  }
}
