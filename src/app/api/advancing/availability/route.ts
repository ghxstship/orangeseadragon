import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, supabaseError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;
  const searchParams = request.nextUrl.searchParams;
  
  const catalogItemId = searchParams.get('catalogItemId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const excludeEventId = searchParams.get('excludeEventId');
  
  if (!catalogItemId) {
    return badRequest('catalogItemId is required');
  }
  
  // Default to next 30 days if no date range specified
  const start = startDate ? new Date(startDate) : new Date();
  const end = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  // Get all advance items for this catalog item within the date range
  const query = supabase
    .from('advance_items')
    .select(`
      id,
      item_name,
      scheduled_delivery,
      actual_delivery,
      status,
      buffer_hours_before,
      buffer_hours_after,
      quantity_required,
      quantity_confirmed,
      location,
      production_advance:production_advances(
        id,
        advance_code,
        advance_type,
        status,
        event_id
      )
    `)
    .eq('catalog_item_id', catalogItemId)
    .not('status', 'in', '("cancelled","returned","complete")')
    .gte('scheduled_delivery', start.toISOString())
    .lte('scheduled_delivery', end.toISOString())
    .order('scheduled_delivery', { ascending: true });
  
  if (excludeEventId) {
    // We need to filter after fetching since it's a nested field
  }
  
  const { data: items, error } = await query;
  
  if (error) {
    return supabaseError(error);
  }
  
  // Get event details for each item
  const eventIds = new Set<string>();
  for (const item of items || []) {
    const advance = Array.isArray(item.production_advance) 
      ? item.production_advance[0] 
      : item.production_advance;
    if (advance?.event_id) {
      eventIds.add(advance.event_id);
    }
  }
  
  const { data: events } = await supabase
    .from('events')
    .select('id, name, start_date, end_date')
    .in('id', Array.from(eventIds));
  
  const eventMap = new Map(events?.map(e => [e.id, e]) || []);
  
  // Build availability timeline
  const timeline = (items || [])
    .filter(item => {
      if (!excludeEventId) return true;
      const advance = Array.isArray(item.production_advance) 
        ? item.production_advance[0] 
        : item.production_advance;
      return advance?.event_id !== excludeEventId;
    })
    .map(item => {
      const advance = Array.isArray(item.production_advance) 
        ? item.production_advance[0] 
        : item.production_advance;
      const event = advance?.event_id ? eventMap.get(advance.event_id) : null;
      
      const scheduledDate = new Date(item.scheduled_delivery);
      const bufferBefore = item.buffer_hours_before || 2;
      const bufferAfter = item.buffer_hours_after || 2;
      
      return {
        id: item.id,
        item_name: item.item_name,
        status: item.status,
        availability_status: getAvailabilityStatus(item.status),
        scheduled_delivery: item.scheduled_delivery,
        actual_delivery: item.actual_delivery,
        block_start: new Date(scheduledDate.getTime() - bufferBefore * 60 * 60 * 1000).toISOString(),
        block_end: new Date(scheduledDate.getTime() + bufferAfter * 60 * 60 * 1000).toISOString(),
        quantity_required: item.quantity_required,
        quantity_confirmed: item.quantity_confirmed,
        location: item.location,
        advance: advance ? {
          id: advance.id,
          advance_code: advance.advance_code,
          advance_type: advance.advance_type,
          status: advance.status,
        } : null,
        event: event ? {
          id: event.id,
          name: event.name,
          start_date: event.start_date,
          end_date: event.end_date,
        } : null,
      };
    });
  
  // Calculate availability windows (gaps between bookings)
  const availabilityWindows = calculateAvailabilityWindows(timeline, start, end);
  
  return apiSuccess({
    catalogItemId,
    dateRange: { start: start.toISOString(), end: end.toISOString() },
    bookings: timeline,
    availabilityWindows,
    summary: {
      totalBookings: timeline.length,
      availableWindows: availabilityWindows.length,
      nextAvailable: availabilityWindows[0]?.start || null,
    },
  });
}

function getAvailabilityStatus(status: string): string {
  switch (status) {
    case 'complete':
    case 'returned':
    case 'cancelled':
      return 'available';
    case 'delivered':
    case 'installed':
    case 'tested':
    case 'struck':
      return 'deployed';
    case 'in_transit':
    case 'shipped':
      return 'in_transit';
    case 'confirmed':
    case 'ordered':
      return 'reserved';
    default:
      return 'pending';
  }
}

interface TimelineItem {
  block_start: string;
  block_end: string;
}

function calculateAvailabilityWindows(
  timeline: TimelineItem[], 
  rangeStart: Date, 
  rangeEnd: Date
): Array<{ start: string; end: string; duration_hours: number }> {
  if (timeline.length === 0) {
    return [{
      start: rangeStart.toISOString(),
      end: rangeEnd.toISOString(),
      duration_hours: (rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60),
    }];
  }
  
  // Sort by block start
  const sorted = [...timeline].sort((a, b) => 
    new Date(a.block_start).getTime() - new Date(b.block_start).getTime()
  );
  
  const windows: Array<{ start: string; end: string; duration_hours: number }> = [];
  let currentEnd = rangeStart;
  
  for (const booking of sorted) {
    const blockStart = new Date(booking.block_start);
    
    if (blockStart > currentEnd) {
      const durationHours = (blockStart.getTime() - currentEnd.getTime()) / (1000 * 60 * 60);
      if (durationHours >= 1) { // Only include windows >= 1 hour
        windows.push({
          start: currentEnd.toISOString(),
          end: blockStart.toISOString(),
          duration_hours: durationHours,
        });
      }
    }
    
    const blockEnd = new Date(booking.block_end);
    if (blockEnd > currentEnd) {
      currentEnd = blockEnd;
    }
  }
  
  // Check for availability after last booking
  if (currentEnd < rangeEnd) {
    const durationHours = (rangeEnd.getTime() - currentEnd.getTime()) / (1000 * 60 * 60);
    if (durationHours >= 1) {
      windows.push({
        start: currentEnd.toISOString(),
        end: rangeEnd.toISOString(),
        duration_hours: durationHours,
      });
    }
  }
  
  return windows;
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;
  
  try {
    const body = await request.json();
    const { action, catalogItemId, requestedDate, durationHours, excludeEventId } = body;
    
    if (action === 'check') {
      // Quick availability check for a specific date/time
      if (!catalogItemId || !requestedDate) {
        return badRequest('catalogItemId and requestedDate are required');
      }
      
      const requested = new Date(requestedDate);
      const duration = durationHours || 4;
      const bufferHours = 2;
      
      const checkStart = new Date(requested.getTime() - bufferHours * 60 * 60 * 1000);
      const checkEnd = new Date(requested.getTime() + (duration + bufferHours) * 60 * 60 * 1000);
      
      const query = supabase
        .from('advance_items')
        .select(`
          id,
          item_name,
          scheduled_delivery,
          status,
          production_advance:production_advances(event_id)
        `)
        .eq('catalog_item_id', catalogItemId)
        .not('status', 'in', '("cancelled","returned","complete")')
        .gte('scheduled_delivery', checkStart.toISOString())
        .lte('scheduled_delivery', checkEnd.toISOString());
      
      const { data: conflicts } = await query;
      
      // Filter out same event if specified
      const filteredConflicts = (conflicts || []).filter(item => {
        if (!excludeEventId) return true;
        const advance = Array.isArray(item.production_advance) 
          ? item.production_advance[0] 
          : item.production_advance;
        return advance?.event_id !== excludeEventId;
      });
      
      return apiSuccess({
        available: filteredConflicts.length === 0,
        conflicts: filteredConflicts.map(c => ({
          id: c.id,
          item_name: c.item_name,
          scheduled_delivery: c.scheduled_delivery,
          status: c.status,
        })),
        requestedDate,
        checkWindow: {
          start: checkStart.toISOString(),
          end: checkEnd.toISOString(),
        },
      });
    }
    
    return badRequest('Invalid action');
  } catch {
    return badRequest('Invalid request body');
  }
}
