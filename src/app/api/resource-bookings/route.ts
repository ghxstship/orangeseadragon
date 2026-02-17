import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requirePolicy } from '@/lib/api/guard';
import { apiPaginated, apiSuccess, badRequest, serverError, supabaseError } from '@/lib/api/response';
import { captureError, extractRequestContext } from '@/lib/observability';
import type { Database } from '@/types/database';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const incomingBookingSchema = z.object({
  id: z.string().uuid('id must be a valid UUID').optional(),
  userId: z.string().uuid('userId must be a valid UUID').optional(),
  projectId: z.string().uuid('projectId must be a valid UUID').optional(),
  role: z.string().trim().min(1).max(255).optional(),
  userName: z.string().trim().max(255).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must use YYYY-MM-DD format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must use YYYY-MM-DD format'),
  hoursPerDay: z.coerce.number().min(0.25).max(24).optional(),
  status: z.enum(['confirmed', 'tentative', 'placeholder']).optional(),
});

const upsertBookingsSchema = z.object({
  bookings: z.array(incomingBookingSchema).min(1, 'bookings array required'),
});

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function isSupabaseError(error: unknown): error is { message: string; code?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  );
}

export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, membership } = auth;

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const userId = searchParams.get('userId');
  const page = parsePositiveInt(searchParams.get('page'), DEFAULT_PAGE);
  const limit = Math.min(parsePositiveInt(searchParams.get('limit'), DEFAULT_LIMIT), MAX_LIMIT);

  if (projectId && !z.string().uuid().safeParse(projectId).success) {
    return badRequest('projectId must be a valid UUID');
  }

  if (userId && !z.string().uuid().safeParse(userId).success) {
    return badRequest('userId must be a valid UUID');
  }

  let query = supabase
    .from('resource_bookings')
    .select('*', { count: 'exact' })
    .eq('organization_id', membership.organization_id)
    .order('start_date', { ascending: true });

  if (projectId) query = query.eq('project_id', projectId);
  if (userId) query = query.eq('user_id', userId);

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return supabaseError(error);
  }

  return apiPaginated(data || [], {
    page,
    limit,
    total: count || 0,
  });
}

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.write');
  if (auth.error) return auth.error;
  const { supabase, user, membership } = auth;
  const requestContext = extractRequestContext(request.headers);

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return badRequest('Invalid JSON request body');
  }

  const parsedBody = upsertBookingsSchema.safeParse(rawBody);
  if (!parsedBody.success) {
    return badRequest('Validation failed', {
      issues: parsedBody.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  const bookings = parsedBody.data.bookings;

  const hasDateRangeError = bookings.some((booking) => booking.startDate > booking.endDate);
  if (hasDateRangeError) {
    return badRequest('Each booking must have startDate earlier than or equal to endDate');
  }

  const incomingIds = bookings
    .map((booking) => booking.id)
    .filter((id): id is string => Boolean(id));

  if (incomingIds.length > 0) {
    const { data: existingBookings, error: existingBookingsError } = await supabase
      .from('resource_bookings')
      .select('id, organization_id')
      .in('id', incomingIds);

    if (existingBookingsError) {
      return supabaseError(existingBookingsError);
    }

    const unauthorizedBookingId = existingBookings?.find(
      (booking) => booking.organization_id !== membership.organization_id
    )?.id;

    if (unauthorizedBookingId) {
      return badRequest(`Booking ${unauthorizedBookingId} is not accessible in the current organization`);
    }
  }

  const rows: Database['public']['Tables']['resource_bookings']['Insert'][] = bookings.map((booking) => ({
    id: booking.id,
    user_id: booking.userId || null,
    project_id: booking.projectId || null,
    start_date: booking.startDate,
    end_date: booking.endDate,
    hours_per_day: booking.hoursPerDay ?? 8,
    booking_type: booking.status ?? 'confirmed',
    status: 'active',
    role: booking.role || booking.userName || 'General Crew',
    organization_id: membership.organization_id,
    created_by: user.id,
  }));

  try {
    const { data, error } = await supabase
      .from('resource_bookings')
      .upsert(rows, { onConflict: 'id' })
      .select();

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(data || [], {
      savedCount: rows.length,
      message: `${rows.length} booking(s) saved`,
    });
  } catch (error) {
    if (isSupabaseError(error)) {
      return supabaseError(error);
    }

    captureError(error, 'api.resource_bookings.upsert.unhandled_error', {
      organization_id: membership.organization_id,
      user_id: user.id,
      ...requestContext,
    });
    return serverError('Failed to save resource bookings');
  }
}
