// /app/api/calendar/aggregated/route.ts

import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * CALENDAR EVENTS API (SSOT)
 * 
 * Queries calendar_events table directly. All source entities (events,
 * productions, tasks, contracts, etc.) sync to this table via database
 * triggers. RLS policies enforce RBAC at the database level.
 * 
 * Query Parameters:
 * - startDate: ISO date string (required)
 * - endDate: ISO date string (required)
 * - sources: comma-separated list of entity_type values (optional)
 * - projectId: filter by project (optional) - requires join to source
 */

export type CalendarSourceType =
  | 'event'
  | 'production'
  | 'task'
  | 'contract'
  | 'activation'
  | 'shift'
  | 'maintenance'
  | 'calendar_event';

const SOURCE_CONFIG: Record<CalendarSourceType, { label: string; color: string; basePath: string }> = {
  event: { label: 'Events', color: 'hsl(var(--primary))', basePath: '/productions/events' },
  production: { label: 'Productions', color: 'hsl(var(--chart-5))', basePath: '/productions' },
  task: { label: 'Tasks', color: 'hsl(var(--chart-4))', basePath: '/core/tasks' },
  contract: { label: 'Contracts', color: 'hsl(var(--chart-income))', basePath: '/business/contracts' },
  activation: { label: 'Activations', color: 'hsl(var(--chart-3))', basePath: '/productions/activations' },
  shift: { label: 'Shifts', color: 'hsl(var(--chart-1))', basePath: '/people/scheduling' },
  maintenance: { label: 'Maintenance', color: 'hsl(var(--chart-expense))', basePath: '/assets/maintenance' },
  calendar_event: { label: 'Calendar', color: 'hsl(var(--secondary))', basePath: '/core/calendar' },
};

export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;

  const searchParams = request.nextUrl.searchParams;
  
  // Parse required date range
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  
  if (!startDate || !endDate) {
    return badRequest('startDate and endDate are required');
  }

  // Parse optional filters
  const sourcesParam = searchParams.get('sources');
  const sources = sourcesParam?.split(',') as CalendarSourceType[] | undefined;

  try {
    // Build query - RLS policies handle organization filtering and RBAC
    type CalendarEventRow = {
      id: string;
      title: string;
      description: string | null;
      start_time: string;
      end_time: string;
      all_day: boolean | null;
      timezone: string | null;
      entity_type: string | null;
      entity_id: string | null;
      color: string | null;
      location: string | null;
      visibility: string | null;
    };

    let query = supabase
      .from('calendar_events')
      .select('*')
      .gte('start_time', startDate)
      .lte('start_time', endDate + 'T23:59:59')
      .order('start_time', { ascending: true });

    // Filter by source types if specified
    if (sources && sources.length > 0) {
      query = query.in('entity_type', sources);
    }

    const { data, error } = await query;

    if (error) {
      captureError(error, 'api.calendar.aggregated.error');
      return supabaseError(error);
    }

    // Transform to unified format with source paths
    const items = ((data || []) as CalendarEventRow[]).map((item) => {
      const sourceType = (item.entity_type || 'calendar_event') as CalendarSourceType;
      const config = SOURCE_CONFIG[sourceType] || SOURCE_CONFIG.calendar_event;
      
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        startTime: item.start_time,
        endTime: item.end_time,
        allDay: item.all_day || false,
        timezone: item.timezone,
        sourceType,
        sourceId: item.entity_id || item.id,
        sourcePath: item.entity_id 
          ? `${config.basePath}/${item.entity_id}`
          : `${config.basePath}/${item.id}`,
        color: item.color || config.color,
        location: item.location,
        visibility: item.visibility,
      };
    });

    // Count by source type
    const sourceCounts = new Map<CalendarSourceType, number>();
    items.forEach((item) => {
      sourceCounts.set(item.sourceType, (sourceCounts.get(item.sourceType) || 0) + 1);
    });

    // Build sources array for UI filtering
    const enabledSources = sources || Object.keys(SOURCE_CONFIG) as CalendarSourceType[];
    const sourcesResult = enabledSources.map((type) => ({
      type,
      count: sourceCounts.get(type) || 0,
      label: SOURCE_CONFIG[type]?.label || type,
      color: SOURCE_CONFIG[type]?.color || 'hsl(var(--primary))',
    }));

    return apiSuccess({ items, sources: sourcesResult });
  } catch (error) {
    captureError(error, 'api.calendar.aggregated.error');
    return serverError('Failed to fetch calendar data');
  }
}
