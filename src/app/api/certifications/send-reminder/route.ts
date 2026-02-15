// /app/api/certifications/send-reminder/route.ts
// Send certification renewal reminders

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, supabaseError, badRequest, serverError } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;

  try {
    const { certificationIds } = await request.json();

    if (!Array.isArray(certificationIds) || certificationIds.length === 0) {
      return badRequest('certificationIds array is required');
    }

    const { data: certs, error } = await supabase
      .from('employee_certifications')
      .select('id, employee_id, certification_name, expiry_date')
      .in('id', certificationIds);

    if (error) return supabaseError(error);

    // Create notification records for each certification holder
    const notifications = (certs || []).map((cert) => ({
      user_id: cert.employee_id,
      type: 'certification_reminder',
      title: `Certification Renewal Required: ${cert.certification_name}`,
      body: `Your ${cert.certification_name} certification expires on ${new Date(cert.expiry_date).toLocaleDateString()}. Please renew it promptly.`,
      source_entity: 'certification',
      source_id: cert.id,
      status: 'unread',
      priority: 'high',
    }));

    if (notifications.length > 0) {
      const { error: insertError } = await supabase
        .from('inbox_items')
        .insert(notifications);

      if (insertError) {
        console.error('[Cert Reminder] Insert error:', insertError);
      }
    }

    return apiSuccess({ sent: notifications.length });
  } catch (err) {
    console.error('[Cert Reminder] error:', err);
    return serverError('Failed to send reminders');
  }
}
