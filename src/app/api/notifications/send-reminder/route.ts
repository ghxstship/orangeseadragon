// /app/api/notifications/send-reminder/route.ts
// Send reminder notifications for compliance items, certifications, etc.

import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;

  try {
    const { itemIds, type } = await request.json();

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return badRequest('itemIds array is required');
    }

    // Determine source table based on type
    const sourceTable = type === 'compliance' ? 'compliance_items' : 'employee_certifications';

    const { data: items } = await supabase
      .from(sourceTable)
      .select('id, employee_id')
      .in('id', itemIds);

    if (!items || items.length === 0) {
      return apiSuccess({ sent: 0 });
    }

    const notifications = items.map((item) => ({
      user_id: item.employee_id,
      type: 'reminder',
      title: `${type === 'compliance' ? 'Compliance' : 'Certification'} Reminder`,
      body: `You have a pending ${type || 'compliance'} item that requires your attention.`,
      source_entity: type || 'compliance',
      source_id: item.id,
      status: 'unread',
      priority: 'high',
    }));

    const { error: insertError } = await supabase
      .from('inbox_items')
      .insert(notifications);

    if (insertError) {
      captureError(insertError, 'api.notifications.send-reminder.error');
    }

    return apiSuccess({ sent: notifications.length });
  } catch (err) {
    captureError(err, 'api.notifications.send-reminder.error');
    return serverError('Failed to send reminders');
  }
}
