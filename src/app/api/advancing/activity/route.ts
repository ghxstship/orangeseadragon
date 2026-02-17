import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, supabaseError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;
  const searchParams = request.nextUrl.searchParams;
  
  const entityType = searchParams.get('entityType');
  const entityId = searchParams.get('entityId');
  const eventId = searchParams.get('eventId');
  const advanceId = searchParams.get('advanceId');
  const action = searchParams.get('action');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '50');
  
  let query = supabase
    .from('activity_events')
    .select('*', { count: 'exact' });
  
  if (entityType && entityId) {
    query = query.eq('entity_type', entityType).eq('entity_id', entityId);
  }
  if (eventId) query = query.eq('event_id', eventId);
  if (advanceId) {
    // Get activities for all items in this advance
    const { data: items } = await supabase
      .from('advance_items')
      .select('id')
      .eq('production_advance_id', advanceId);
    
    const itemIds = items?.map(i => i.id) || [];
    
    query = query.or(`entity_id.eq.${advanceId},entity_id.in.(${itemIds.join(',')})`);
  }
  if (action) query = query.eq('action', action);
  
  query = query
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  
  const { data, error, count } = await query;
  
  if (error) {
    return supabaseError(error);
  }
  
  return apiSuccess(data || [], { total: count || 0, page, pageSize });
}

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { user, supabase } = auth;
  
  try {
    const body = await request.json();
    const { 
      entityType, 
      entityId, 
      action, 
      fieldChanges, 
      oldValues, 
      newValues, 
      eventId,
      metadata 
    } = body;
    
    if (!entityType || !entityId || !action) {
      return badRequest('entityType, entityId, and action are required');
    }
    
    const userId = user.id;
    
    // Get actor name
    let actorName = 'System';
    const { data: actorUser } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', userId)
      .single();
    actorName = actorUser?.full_name || 'Unknown User';
    
    // Get organization ID from the entity
    let orgId: string | null = null;
    
    if (entityType === 'advance_item') {
      const { data: item } = await supabase
        .from('advance_items')
        .select('organization_id')
        .eq('id', entityId)
        .single();
      orgId = item?.organization_id;
    } else if (entityType === 'production_advance') {
      const { data: advance } = await supabase
        .from('production_advances')
        .select('organization_id')
        .eq('id', entityId)
        .single();
      orgId = advance?.organization_id;
    }
    
    if (!orgId) {
      return badRequest('Could not determine organization');
    }
    
    const { data, error } = await supabase
      .from('activity_events')
      .insert({
        organization_id: orgId,
        entity_type: entityType,
        entity_id: entityId,
        action,
        actor_id: userId,
        actor_name: actorName,
        field_changes: fieldChanges || [],
        old_values: oldValues || {},
        new_values: newValues || {},
        event_id: eventId,
        metadata: metadata || {},
      })
      .select()
      .single();
    
    if (error) {
      return supabaseError(error);
    }
    
    return apiCreated(data);
  } catch {
    return badRequest('Invalid request body');
  }
}
