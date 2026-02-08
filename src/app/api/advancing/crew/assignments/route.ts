import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, notFound, supabaseError, conflict } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;
  const searchParams = request.nextUrl.searchParams;
  
  const crewMemberId = searchParams.get('crewMemberId');
  const eventId = searchParams.get('eventId');
  const advanceId = searchParams.get('advanceId');
  const status = searchParams.get('status');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '50');
  
  let query = supabase
    .from('crew_assignments')
    .select(`
      *,
      crew_member:crew_members(id, full_name, skills, avatar_url, hourly_rate, day_rate),
      event:events(id, name, start_date, end_date, venue_id),
      advance:production_advances(id, advance_code, advance_type)
    `, { count: 'exact' });
  
  if (crewMemberId) query = query.eq('crew_member_id', crewMemberId);
  if (eventId) query = query.eq('event_id', eventId);
  if (advanceId) query = query.eq('advance_id', advanceId);
  if (status) query = query.eq('status', status);
  
  if (startDate) {
    query = query.gte('shift_start', startDate);
  }
  if (endDate) {
    query = query.lte('shift_end', endDate);
  }
  
  query = query
    .order('shift_start', { ascending: true })
    .range((page - 1) * pageSize, page * pageSize - 1);
  
  const { data, error, count } = await query;
  
  if (error) {
    return supabaseError(error);
  }
  
  // Calculate hours for each assignment
  const assignmentsWithHours = (data || []).map(assignment => {
    const shiftStart = new Date(assignment.shift_start);
    const shiftEnd = new Date(assignment.shift_end);
    const scheduledHours = (shiftEnd.getTime() - shiftStart.getTime()) / (1000 * 60 * 60);
    
    let actualHours = null;
    if (assignment.actual_start && assignment.actual_end) {
      const actualStart = new Date(assignment.actual_start);
      const actualEnd = new Date(assignment.actual_end);
      actualHours = (actualEnd.getTime() - actualStart.getTime()) / (1000 * 60 * 60);
      actualHours -= (assignment.break_minutes || 0) / 60;
    }
    
    return {
      ...assignment,
      scheduled_hours: Math.round(scheduledHours * 100) / 100,
      actual_hours: actualHours ? Math.round(actualHours * 100) / 100 : null,
    };
  });
  
  return apiSuccess({
    records: assignmentsWithHours,
    total: count || 0,
    page,
    pageSize,
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;
  
  try {
    const body = await request.json();
    const { 
      crewMemberId, 
      eventId, 
      advanceId,
      advanceItemId,
      role, 
      department,
      shiftStart, 
      shiftEnd,
      rateType,
      rateAmount,
      estimatedHours,
      notes,
      specialInstructions
    } = body;
    
    if (!crewMemberId || !role || !shiftStart || !shiftEnd) {
      return badRequest('crewMemberId, role, shiftStart, and shiftEnd are required');
    }
    
    const userId = user.id;
    
    // Get organization from crew member
    const { data: crewMember } = await supabase
      .from('crew_members')
      .select('organization_id, hourly_rate, day_rate')
      .eq('id', crewMemberId)
      .single();
    
    if (!crewMember) {
      return notFound('Crew member not found');
    }
    
    // Check for conflicts
    const { data: existingAssignments } = await supabase
      .from('crew_assignments')
      .select('id, event:events(name), shift_start, shift_end')
      .eq('crew_member_id', crewMemberId)
      .not('status', 'in', '("cancelled","declined")')
      .or(`shift_start.lte.${shiftEnd},shift_end.gte.${shiftStart}`);
    
    const conflicts = (existingAssignments || []).filter(a => {
      const aStart = new Date(a.shift_start);
      const aEnd = new Date(a.shift_end);
      const newStart = new Date(shiftStart);
      const newEnd = new Date(shiftEnd);
      return aStart < newEnd && aEnd > newStart;
    });
    
    if (conflicts.length > 0) {
      return conflict('Crew member has conflicting assignments');
    }
    
    // Use crew member's default rate if not specified
    const finalRateType = rateType || 'hourly';
    const finalRateAmount = rateAmount || (finalRateType === 'hourly' ? crewMember.hourly_rate : crewMember.day_rate);
    
    const { data, error } = await supabase
      .from('crew_assignments')
      .insert({
        organization_id: crewMember.organization_id,
        crew_member_id: crewMemberId,
        event_id: eventId,
        advance_id: advanceId,
        advance_item_id: advanceItemId,
        role,
        department,
        shift_start: shiftStart,
        shift_end: shiftEnd,
        rate_type: finalRateType,
        rate_amount: finalRateAmount,
        estimated_hours: estimatedHours,
        status: 'pending',
        notes,
        special_instructions: specialInstructions,
        created_by: userId,
      })
      .select(`
        *,
        crew_member:crew_members(id, full_name, email),
        event:events(id, name)
      `)
      .single();
    
    if (error) {
      return supabaseError(error);
    }
    
    // Update crew availability to 'booked' for this date
    const shiftDate = new Date(shiftStart).toISOString().split('T')[0];
    await supabase
      .from('crew_availability')
      .upsert({
        organization_id: crewMember.organization_id,
        crew_member_id: crewMemberId,
        date: shiftDate,
        status: 'booked',
        event_id: eventId,
      }, {
        onConflict: 'crew_member_id,date,start_time'
      });
    
    return apiCreated(data);
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
    const { assignmentId, action, ...updateFields } = body;
    
    if (!assignmentId) {
      return badRequest('assignmentId is required');
    }
    
    const userId = user.id;
    
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    
    switch (action) {
      case 'invite':
        updateData.status = 'invited';
        updateData.invited_at = new Date().toISOString();
        break;
      case 'confirm':
        updateData.status = 'confirmed';
        updateData.responded_at = new Date().toISOString();
        updateData.confirmed_by = userId;
        break;
      case 'decline':
        updateData.status = 'declined';
        updateData.responded_at = new Date().toISOString();
        break;
      case 'check_in':
        updateData.status = 'checked_in';
        updateData.actual_start = new Date().toISOString();
        break;
      case 'check_out':
        updateData.status = 'checked_out';
        updateData.actual_end = new Date().toISOString();
        break;
      case 'complete':
        updateData.status = 'completed';
        break;
      case 'cancel':
        updateData.status = 'cancelled';
        break;
      case 'no_show':
        updateData.status = 'no_show';
        break;
      default:
        // General update
        const allowedFields = [
          'role', 'department', 'shift_start', 'shift_end', 
          'rate_type', 'rate_amount', 'estimated_hours',
          'actual_start', 'actual_end', 'break_minutes',
          'notes', 'special_instructions'
        ];
        
        for (const field of allowedFields) {
          const camelField = field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
          if (updateFields[camelField] !== undefined) {
            updateData[field] = updateFields[camelField];
          } else if (updateFields[field] !== undefined) {
            updateData[field] = updateFields[field];
          }
        }
    }
    
    const { data, error } = await supabase
      .from('crew_assignments')
      .update(updateData)
      .eq('id', assignmentId)
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
