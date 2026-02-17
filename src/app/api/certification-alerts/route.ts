// /app/api/certification-alerts/route.ts
// Certification alerts — expiring and expired certifications

import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function GET() {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;

  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const { data, error } = await supabase
      .from('employee_certifications')
      .select('id, certification_name, employee_name, expiry_date, status')
      .or(`expiry_date.lte.${thirtyDaysFromNow.toISOString()},status.eq.expired`)
      .order('expiry_date', { ascending: true })
      .limit(100);

    if (error) return supabaseError(error);

    const alerts = (data || []).map((cert) => {
      const expiry = new Date(cert.expiry_date);
      const now = new Date();
      const daysUntil = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        ...cert,
        daysUntilExpiry: daysUntil,
        severity: daysUntil < 0 ? 'expired' : daysUntil <= 7 ? 'critical' : daysUntil <= 14 ? 'warning' : 'info',
      };
    });

    return apiSuccess(alerts);
  } catch (err) {
    captureError(err, 'api.certification-alerts.error');
    return serverError('Failed to fetch certification alerts');
  }
}
