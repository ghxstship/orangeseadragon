import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, serverError, supabaseError } from '@/lib/api/response';
import { captureError, extractRequestContext } from '@/lib/observability';
import type { Database } from '@/types/database';

const DEFAULT_MONTHS_BACK = 3;
const DEFAULT_MONTHS_AHEAD = 6;
const HOURS_PER_MONTH = 160;

const utilizationForecastQuerySchema = z.object({
  monthsBack: z.coerce.number().int().min(1).max(12).optional(),
  monthsAhead: z.coerce.number().int().min(1).max(12).optional(),
});

type TimeEntryForecastRow = Pick<
  Database['public']['Tables']['time_entries']['Row'],
  'user_id' | 'hours' | 'billable' | 'date'
>;

type ResourceBookingForecastRow = Pick<
  Database['public']['Tables']['resource_bookings']['Row'],
  'user_id' | 'start_date' | 'end_date' | 'hours_per_day' | 'total_hours'
>;

function isSupabaseError(error: unknown): error is { message: string; code?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  );
}

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

function firstDayOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function lastDayOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
}

function daysInclusive(start: Date, end: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((end.getTime() - start.getTime()) / msPerDay) + 1;
}

/**
 * G10: Utilization forecasting — current + future by person/team.
 * Combines current time entries + future scheduled bookings to project
 * utilization rates per person/team over the next 3-6 months.
 */
export async function GET(_request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, membership } = auth;
  const requestContext = extractRequestContext(_request.headers);

  const parsedQuery = utilizationForecastQuerySchema.safeParse(
    Object.fromEntries(_request.nextUrl.searchParams.entries())
  );

  if (!parsedQuery.success) {
    return badRequest('Validation failed', {
      issues: parsedQuery.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  const monthsBack = parsedQuery.data.monthsBack ?? DEFAULT_MONTHS_BACK;
  const monthsAhead = parsedQuery.data.monthsAhead ?? DEFAULT_MONTHS_AHEAD;

  const now = firstDayOfMonth(new Date());
  const rangeStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsBack, 1));
  const rangeEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + monthsAhead, 0));
  const nowISO = now.toISOString().split('T')[0];
  const rangeStartISO = rangeStart.toISOString().split('T')[0];
  const rangeEndISO = rangeEnd.toISOString().split('T')[0];

  try {
    let timeQuery = supabase
      .from('time_entries')
      .select('user_id, hours, billable, date')
      .gte('date', rangeStartISO)
      .lte('date', nowISO);

    timeQuery = timeQuery.eq('org_id', membership.organization_id);

    const { data: timeEntries, error: timeError } = await timeQuery;
    if (timeError) {
      return supabaseError(timeError);
    }

    let bookingQuery = supabase
      .from('resource_bookings')
      .select('user_id, total_hours, hours_per_day, start_date, end_date')
      .gte('end_date', nowISO)
      .lte('start_date', rangeEndISO);

    bookingQuery = bookingQuery.eq('organization_id', membership.organization_id);

    const { data: bookings, error: bookingError } = await bookingQuery;
    if (bookingError) {
      return supabaseError(bookingError);
    }

    const typedTimeEntries: TimeEntryForecastRow[] = timeEntries ?? [];
    const typedBookings: ResourceBookingForecastRow[] = bookings ?? [];

    const monthlyData: Record<string, { month: string; billableHours: number; totalHours: number; bookedHours: number; capacity: number }> = {};

    for (let m = -monthsBack; m < monthsAhead; m++) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + m, 1));
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      const label = key;
      monthlyData[key] = { month: label, billableHours: 0, totalHours: 0, bookedHours: 0, capacity: 0 };
    }

    const uniqueUsers = new Set<string>();

    for (const entry of typedTimeEntries) {
      const date = new Date(entry.date);
      const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
      const hours = Number(entry.hours || 0);
      if (monthlyData[key]) {
        monthlyData[key].totalHours += hours;
        if (entry.billable) monthlyData[key].billableHours += hours;
      }
      uniqueUsers.add(entry.user_id);
    }

    for (const booking of typedBookings) {
      const bookingStart = new Date(booking.start_date);
      const bookingEnd = new Date(booking.end_date);
      const totalDurationDays = Math.max(1, daysInclusive(bookingStart, bookingEnd));
      const totalHours = Number(booking.total_hours ?? (booking.hours_per_day ?? 0) * totalDurationDays);

      let monthCursor = firstDayOfMonth(bookingStart);
      const bookingEndMonth = firstDayOfMonth(bookingEnd);

      while (monthCursor <= bookingEndMonth) {
        const key = `${monthCursor.getUTCFullYear()}-${String(monthCursor.getUTCMonth() + 1).padStart(2, '0')}`;
        if (monthlyData[key]) {
          const monthStart = firstDayOfMonth(monthCursor);
          const monthEnd = lastDayOfMonth(monthCursor);
          const overlapStart = bookingStart > monthStart ? bookingStart : monthStart;
          const overlapEnd = bookingEnd < monthEnd ? bookingEnd : monthEnd;

          if (overlapStart <= overlapEnd) {
            const overlapDays = daysInclusive(overlapStart, overlapEnd);
            const proportionalHours = booking.total_hours !== null
              ? totalHours * (overlapDays / totalDurationDays)
              : (booking.hours_per_day ?? 0) * overlapDays;

            monthlyData[key].bookedHours += proportionalHours;
          }
        }

        monthCursor = new Date(
          Date.UTC(monthCursor.getUTCFullYear(), monthCursor.getUTCMonth() + 1, 1)
        );
      }

      if (booking.user_id) uniqueUsers.add(booking.user_id);
    }

    const headcount = Math.max(uniqueUsers.size, 1);
    const totalCapacity = headcount * HOURS_PER_MONTH;

    const forecast = Object.values(monthlyData).map((m) => ({
      month: m.month,
      billableHours: roundToTwo(m.billableHours),
      totalHours: roundToTwo(m.totalHours),
      bookedHours: roundToTwo(m.bookedHours),
      capacity: totalCapacity,
      utilization: totalCapacity > 0 ? Math.round(((m.billableHours + m.bookedHours) / totalCapacity) * 100) : 0,
    }));

    return apiSuccess(forecast, {
      headcount,
      hoursPerMonth: HOURS_PER_MONTH,
      monthsBack,
      monthsAhead,
    });
  } catch (err) {
    if (isSupabaseError(err)) {
      return supabaseError(err);
    }

    captureError(err, 'api.utilization.forecast.unhandled_error', {
      organization_id: membership.organization_id,
      ...requestContext,
    });
    return serverError('Failed to generate utilization forecast');
  }
}
