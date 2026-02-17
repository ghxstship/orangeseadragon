import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, supabaseError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;
  const searchParams = request.nextUrl.searchParams;
  
  const status = searchParams.get('status') || 'active';
  const skills = searchParams.get('skills');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '25');
  
  let query = supabase
    .from('crew_members')
    .select(`
      *,
      user:users(id, full_name, email, avatar_url)
    `, { count: 'exact' });
  
  if (status !== 'all') {
    query = query.eq('status', status);
  }
  
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }
  
  if (skills) {
    const skillList = skills.split(',');
    query = query.contains('skills', skillList);
  }
  
  query = query
    .order('full_name', { ascending: true })
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
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { user, supabase } = auth;
  
  try {
    const body = await request.json();
    const { 
      fullName, 
      email, 
      phone, 
      skills, 
      certifications,
      hourlyRate,
      dayRate,
      currency,
      defaultAvailability,
      notes,
      userId
    } = body;
    
    if (!fullName) {
      return badRequest('fullName is required');
    }
    
    const currentUserId = user.id;
    
    // Get organization from current user
    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', currentUserId)
      .single();
    
    if (!userOrg) {
      return badRequest('User organization not found');
    }
    
    const { data, error } = await supabase
      .from('crew_members')
      .insert({
        organization_id: userOrg.organization_id,
        user_id: userId,
        full_name: fullName,
        email,
        phone,
        skills: skills || [],
        certifications: certifications || [],
        hourly_rate: hourlyRate,
        day_rate: dayRate,
        currency: currency || 'USD',
        default_availability: defaultAvailability || {},
        notes,
        status: 'active',
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
