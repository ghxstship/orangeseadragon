import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, notFound, supabaseError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;
  const searchParams = request.nextUrl.searchParams;
  
  const tagValue = searchParams.get('tagValue');
  const tagId = searchParams.get('tagId');
  const itemId = searchParams.get('itemId');
  
  if (tagValue) {
    // Look up by tag value (QR/barcode scan)
    const { data, error } = await supabase
      .from('asset_tags')
      .select(`
        *,
        item:advance_items(
          *,
          category:advance_categories(id, code, name, icon, color),
          vendor:companies(id, name),
          production_advance:production_advances(id, advance_code, event_id, status)
        ),
        catalog_item:advancing_catalog_items(id, name, description, image_url)
      `)
      .eq('tag_value', tagValue)
      .eq('is_active', true)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return notFound('Tag not found');
      }
      return supabaseError(error);
    }
    
    return apiSuccess(data);
  }
  
  if (tagId) {
    const { data, error } = await supabase
      .from('asset_tags')
      .select(`
        *,
        item:advance_items(*),
        catalog_item:advancing_catalog_items(id, name, description, image_url)
      `)
      .eq('id', tagId)
      .single();
    
    if (error) {
      return supabaseError(error);
    }
    
    return apiSuccess(data);
  }
  
  if (itemId) {
    // Get all tags for an item
    const { data, error } = await supabase
      .from('asset_tags')
      .select('*')
      .eq('item_id', itemId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      return supabaseError(error);
    }
    
    return apiSuccess(data);
  }
  
  return badRequest('Missing required parameter: tagValue, tagId, or itemId');
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;
  
  try {
    const body = await request.json();
    const { tagValue, action, location, notes, eventId, advanceId, geoLat, geoLng, photoUrls } = body;
    
    if (!tagValue || !action) {
      return badRequest('tagValue and action are required');
    }
    
    const userId = user.id;
    
    // Look up the tag
    const { data: tag, error: tagError } = await supabase
      .from('asset_tags')
      .select('*, item:advance_items(id, organization_id, item_name, status)')
      .eq('tag_value', tagValue)
      .eq('is_active', true)
      .single();
    
    if (tagError || !tag) {
      return notFound('Tag not found');
    }
    
    const orgId = tag.organization_id || tag.item?.organization_id;
    
    // Create scan event
    const { data: scanEvent, error: scanError } = await supabase
      .from('scan_events')
      .insert({
        organization_id: orgId,
        asset_tag_id: tag.id,
        scanned_by: userId,
        action,
        location,
        notes,
        event_id: eventId,
        advance_id: advanceId,
        geo_lat: geoLat,
        geo_lng: geoLng,
        photo_urls: photoUrls || [],
      })
      .select()
      .single();
    
    if (scanError) {
      return supabaseError(scanError);
    }
    
    // Update tag's last scanned info
    await supabase
      .from('asset_tags')
      .update({
        last_scanned_at: new Date().toISOString(),
        last_scanned_by: userId,
        last_location: location,
      })
      .eq('id', tag.id);
    
    // Update item status based on action
    if (tag.item_id) {
      const statusMap: Record<string, string> = {
        'check_out': 'in_transit',
        'check_in': 'returned',
        'verify': tag.item?.status || 'confirmed',
        'transfer': 'in_transit',
        'inspect': 'tested',
        'damage_report': tag.item?.status || 'pending',
      };
      
      const newStatus = statusMap[action];
      if (newStatus && newStatus !== tag.item?.status) {
        await supabase
          .from('advance_items')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', tag.item_id);
      }
    }
    
    return apiCreated({
      scanEvent,
      tag,
      item: tag.item,
    });
    
  } catch {
    return badRequest('Invalid request body');
  }
}
