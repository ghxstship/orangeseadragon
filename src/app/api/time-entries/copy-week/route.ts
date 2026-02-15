// /app/api/time-entries/copy-week/route.ts
// Copy previous week's time entries to current week

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, supabaseError, badRequest, serverError } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
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
      .select('project_id, task_id, description, hours, entry_date')
      .eq('user_id', user.id)
      .gte('entry_date', sourceWeekStart)
      .lt('entry_date', sourceEnd.toISOString().split('T')[0]);

    if (fetchError) return supabaseError(fetchError);

    if (!sourceEntries || sourceEntries.length === 0) {
      return apiSuccess({ copied: 0 });
    }

    const sourceDateObj = new Date(sourceWeekStart);
    const targetDateObj = new Date(targetWeekStart);
    const dayOffset = Math.round((targetDateObj.getTime() - sourceDateObj.getTime()) / (1000 * 60 * 60 * 24));

    const newEntries = sourceEntries.map((entry) => {
      const entryDate = new Date(entry.entry_date);
      entryDate.setDate(entryDate.getDate() + dayOffset);
      return {
        user_id: user.id,
        project_id: entry.project_id,
        task_id: entry.task_id,
        description: entry.description,
        hours: entry.hours,
        entry_date: entryDate.toISOString().split('T')[0],
      };
    });

    const { error: insertError } = await supabase
      .from('time_entries')
      .insert(newEntries);

    if (insertError) return supabaseError(insertError);

    return apiSuccess({ copied: newEntries.length });
  } catch (err) {
    console.error('[Time Entries Copy] error:', err);
    return serverError('Failed to copy time entries');
  }
}
