// /app/api/certifications/summary/route.ts
// Certification compliance summary stats

import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function GET() {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;

  try {
    const now = new Date().toISOString();
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);

    const { data, error } = await supabase
      .from('employee_certifications')
      .select('id, status, expiry_date');

    if (error) return supabaseError(error);

    const items = data || [];
    const total = items.length;
    const expired = items.filter((c) => c.status === 'expired' || (c.expiry_date && c.expiry_date < now)).length;
    const expiring = items.filter((c) => c.expiry_date && c.expiry_date >= now && c.expiry_date <= thirtyDays.toISOString()).length;
    const compliant = total - expired - expiring;

    return apiSuccess({
      total,
      compliant,
      expiring,
      expired,
      complianceRate: total > 0 ? Math.round((compliant / total) * 100) : 100,
    });
  } catch (err) {
    captureError(err, 'api.certifications.summary.error');
    return serverError('Failed to fetch certification summary');
  }
}
