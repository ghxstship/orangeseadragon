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
      return apiSuccess({ totalAssets: 0, available: 0, deployed: 0, inMaintenance: 0 });
    }

    const [totalRes, deployedRes, maintenanceRes] = await Promise.all([
      supabase
        .from('assets')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId),
      supabase
        .from('assets')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('status', 'deployed'),
      supabase
        .from('assets')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('status', 'maintenance'),
    ]);

    const totalAssets = totalRes.count ?? 0;
    const deployed = deployedRes.count ?? 0;
    const inMaintenance = maintenanceRes.count ?? 0;
    const available = Math.max(0, totalAssets - deployed - inMaintenance);

    return apiSuccess({ totalAssets, available, deployed, inMaintenance });
  } catch (error) {
    captureError(error, 'api.assets.stats.error');
    return serverError('Failed to load asset statistics');
  }
}
