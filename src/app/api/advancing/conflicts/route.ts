import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, supabaseError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;
  const searchParams = request.nextUrl.searchParams;
  
  const eventId = searchParams.get('eventId');
  const advanceId = searchParams.get('advanceId');
  const itemId = searchParams.get('itemId');
  const status = searchParams.get('status') || 'open';
  const severity = searchParams.get('severity');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '25');
  
  let query = supabase
    .from('inventory_conflicts')
    .select('*', { count: 'exact' });
  
  if (eventId) query = query.eq('event_id', eventId);
  if (advanceId) query = query.eq('advance_id', advanceId);
  if (itemId) query = query.eq('item_id', itemId);
  if (status !== 'all') query = query.eq('status', status);
  if (severity) query = query.eq('severity', severity);
  
  query = query
    .order('severity', { ascending: true })
    .order('detected_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  
  const { data, error, count } = await query;
  
  if (error) {
    return supabaseError(error);
  }
  
  return apiSuccess({
    records: data || [],
    total: count || 0,
    page,
    pageSize,
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;
  
  try {
    const body = await request.json();
    const { action, itemId, advanceId } = body;
    
    if (action === 'detect') {
      // Run conflict detection for a specific item or advance
      if (itemId) {
        const conflicts = await detectItemConflicts(supabase, itemId);
        return apiSuccess(conflicts);
      }
      
      if (advanceId) {
        // Get all items in the advance and check each
        const { data: items } = await supabase
          .from('advance_items')
          .select('id')
          .eq('production_advance_id', advanceId);
        
        const allConflicts = [];
        for (const item of items || []) {
          const conflicts = await detectItemConflicts(supabase, item.id);
          allConflicts.push(...conflicts);
        }
        
        // Update advance conflict count
        await supabase
          .from('production_advances')
          .update({ conflict_count: allConflicts.length })
          .eq('id', advanceId);
        
        return apiSuccess(allConflicts);
      }
      
      return badRequest('itemId or advanceId required for detection');
    }
    
    return badRequest('Invalid action');
  } catch {
    return badRequest('Invalid request body');
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;
  
  try {
    const body = await request.json();
    const { conflictId, action, resolutionNotes } = body;
    
    if (!conflictId) {
      return badRequest('conflictId is required');
    }
    
    const userId = user.id;
    
    const updateData: Record<string, unknown> = {};
    
    switch (action) {
      case 'resolve':
        updateData.status = 'resolved';
        updateData.resolved_by = userId;
        updateData.resolved_at = new Date().toISOString();
        updateData.resolution_notes = resolutionNotes;
        break;
      case 'ignore':
        updateData.status = 'ignored';
        updateData.resolved_by = userId;
        updateData.resolved_at = new Date().toISOString();
        updateData.resolution_notes = resolutionNotes || 'Manually ignored';
        break;
      case 'reopen':
        updateData.status = 'open';
        updateData.resolved_by = null;
        updateData.resolved_at = null;
        updateData.resolution_notes = null;
        break;
      default:
        return badRequest('Invalid action');
    }
    
    const { data, error } = await supabase
      .from('inventory_conflicts')
      .update(updateData)
      .eq('id', conflictId)
      .select()
      .single();
    
    if (error) {
      return supabaseError(error);
    }
    
    return apiSuccess(data);
  } catch {
    return badRequest('Invalid request body');
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client type
async function detectItemConflicts(supabase: any, itemId: string) {
  // Get the item with its advance and event info
  const { data: item, error: itemError } = await supabase
    .from('advance_items')
    .select(`
      *,
      production_advance:production_advances(id, event_id, organization_id, advance_code),
      catalog_item:advancing_catalog_items(id, name)
    `)
    .eq('id', itemId)
    .single();
  
  if (itemError || !item) {
    return [];
  }
  
  interface ConflictResult {
    conflict_type: string;
    severity: string;
    description: string;
    conflicting_item_id: string | null;
    suggested_resolutions: Array<{ action: string; label: string }>;
  }
  
  const conflicts: ConflictResult[] = [];
  
  // Skip if no catalog item or no scheduled delivery
  if (!item.catalog_item_id || !item.scheduled_delivery) {
    return conflicts;
  }
  
  const orgId = item.production_advance?.organization_id;
  const eventId = item.production_advance?.event_id;
  
  // Check for double-booking of the same catalog item
  const bufferBefore = item.buffer_hours_before || 2;
  const bufferAfter = item.buffer_hours_after || 2;
  
  const scheduledDate = new Date(item.scheduled_delivery);
  const startWindow = new Date(scheduledDate.getTime() - bufferBefore * 60 * 60 * 1000);
  const endWindow = new Date(scheduledDate.getTime() + bufferAfter * 60 * 60 * 1000);
  
  const { data: overlappingItems } = await supabase
    .from('advance_items')
    .select(`
      id,
      item_name,
      scheduled_delivery,
      status,
      production_advance:production_advances(id, advance_code, event_id)
    `)
    .eq('catalog_item_id', item.catalog_item_id)
    .neq('id', itemId)
    .not('status', 'in', '("cancelled","returned","complete")')
    .not('scheduled_delivery', 'is', null)
    .gte('scheduled_delivery', startWindow.toISOString())
    .lte('scheduled_delivery', endWindow.toISOString());
  
  for (const overlapping of overlappingItems || []) {
    // Skip if same event - handle array type from Supabase
    const advanceData = Array.isArray(overlapping.production_advance) 
      ? overlapping.production_advance[0] 
      : overlapping.production_advance;
    if (advanceData?.event_id === eventId) continue;
    
    conflicts.push({
      conflict_type: 'double_booking',
      severity: 'blocking',
      description: `"${item.item_name}" is already scheduled for ${advanceData?.advance_code || 'another advance'} during this time window`,
      conflicting_item_id: overlapping.id,
      suggested_resolutions: [
        { action: 'substitute', label: 'Use alternative item' },
        { action: 'reschedule', label: 'Change delivery time' },
        { action: 'sub_rent', label: 'Sub-rent from vendor' },
      ],
    });
  }
  
  // Store detected conflicts in database
  for (const conflict of conflicts) {
    // Check if this conflict already exists
    const { data: existing } = await supabase
      .from('inventory_conflicts')
      .select('id')
      .eq('item_id', itemId)
      .eq('conflicting_entity_id', conflict.conflicting_item_id)
      .eq('conflict_type', conflict.conflict_type)
      .eq('status', 'open')
      .single();
    
    if (!existing) {
      await supabase
        .from('inventory_conflicts')
        .insert({
          organization_id: orgId,
          conflict_type: conflict.conflict_type,
          severity: conflict.severity,
          status: 'open',
          entity_type: 'advance_item',
          entity_id: itemId,
          conflicting_entity_type: 'advance_item',
          conflicting_entity_id: conflict.conflicting_item_id,
          event_id: eventId,
          advance_id: item.production_advance_id,
          item_id: itemId,
          description: conflict.description,
          conflict_start: startWindow.toISOString(),
          conflict_end: endWindow.toISOString(),
          suggested_resolutions: conflict.suggested_resolutions,
        });
    }
  }
  
  // Update item conflict count
  await supabase
    .from('advance_items')
    .update({ conflict_count: conflicts.length })
    .eq('id', itemId);
  
  return conflicts;
}
