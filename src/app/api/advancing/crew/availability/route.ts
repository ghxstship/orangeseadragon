import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, notFound, supabaseError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;
  const searchParams = request.nextUrl.searchParams;
  
  const crewMemberId = searchParams.get('crewMemberId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const status = searchParams.get('status');
  
  if (!startDate || !endDate) {
    return badRequest('startDate and endDate are required');
  }
  
  let query = supabase
    .from('crew_availability')
    .select(`
      *,
      crew_member:crew_members(id, full_name, skills, avatar_url),
      event:events(id, name)
    `)
    .gte('date', startDate)
    .lte('date', endDate);
  
  if (crewMemberId) {
    query = query.eq('crew_member_id', crewMemberId);
  }
  
  if (status) {
    query = query.eq('status', status);
  }
  
  query = query.order('date', { ascending: true });
  
  const { data, error } = await query;
  
  if (error) {
    return supabaseError(error);
  }
  
  return apiSuccess(data || []);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;
  
  try {
    const body = await request.json();
    const { crewMemberId, date, startTime, endTime, status, reason, eventId } = body;
    
    if (!crewMemberId || !date || !status) {
      return badRequest('crewMemberId, date, and status are required');
    }
    
    // Get organization from crew member
    const { data: crewMember } = await supabase
      .from('crew_members')
      .select('organization_id')
      .eq('id', crewMemberId)
      .single();
    
    if (!crewMember) {
      return notFound('Crew member not found');
    }
    
    const { data, error } = await supabase
      .from('crew_availability')
      .upsert({
        organization_id: crewMember.organization_id,
        crew_member_id: crewMemberId,
        date,
        start_time: startTime,
        end_time: endTime,
        status,
        reason,
        event_id: eventId,
      }, {
        onConflict: 'crew_member_id,date,start_time'
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

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;
  const searchParams = request.nextUrl.searchParams;
  
  const id = searchParams.get('id');
  
  if (!id) {
    return badRequest('id is required');
  }
  
  const { data, error } = await supabase
    .from('crew_availability')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    return supabaseError(error);
  }
  
  return apiSuccess(data, { message: 'Availability record archived' });
}
