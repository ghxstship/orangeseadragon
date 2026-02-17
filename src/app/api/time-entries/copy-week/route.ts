// /app/api/time-entries/copy-week/route.ts
// Copy previous week's time entries to current week

import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError, badRequest, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, user } = auth;

  try {
    const { sourceWeekStart, targetWeekStart } = await request.json();

    if (!sourceWeekStart || !targetWeekStart) {
      return badRequest('sourceWeekStart and targetWeekStart are required');
    }

    const sourceEnd = new Date(sourceWeekStart);
    sourceEnd.setDate(sourceEnd.getDate() + 7);

    const { data: sourceEntries, error: fetchError } = await supabase
      .from('time_entries')
      .select('project_id, task_id, description, hours, date, org_id, billable')
      .eq('user_id', user.id)
      .gte('date', sourceWeekStart)
      .lt('date', sourceEnd.toISOString().split('T')[0]);

    if (fetchError) return supabaseError(fetchError);

    if (!sourceEntries || sourceEntries.length === 0) {
      return apiSuccess({ copied: 0 });
    }

    const sourceDateObj = new Date(sourceWeekStart);
    const targetDateObj = new Date(targetWeekStart);
    const dayOffset = Math.round((targetDateObj.getTime() - sourceDateObj.getTime()) / (1000 * 60 * 60 * 24));

    const newEntries = sourceEntries.map((entry) => {
      const entryDate = new Date(entry.date);
      entryDate.setDate(entryDate.getDate() + dayOffset);
      return {
        user_id: user.id,
        org_id: entry.org_id,
        project_id: entry.project_id,
        task_id: entry.task_id,
        description: entry.description || '',
        hours: entry.hours,
        date: entryDate.toISOString().split('T')[0],
        status: 'draft',
        billable: entry.billable ?? true,
      };
    });

    const { error: insertError } = await supabase
      .from('time_entries')
      .insert(newEntries);

    if (insertError) return supabaseError(insertError);

    return apiSuccess({ copied: newEntries.length });
  } catch (err) {
    captureError(err, 'api.time-entries.copy-week.error');
    return serverError('Failed to copy time entries');
  }
}
