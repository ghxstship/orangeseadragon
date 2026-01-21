// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const eventId = searchParams.get('event_id');
    const organizationId = searchParams.get('organization_id');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('crew_calls')
      .select('*, event:events(id, name)', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('call_time', { ascending: true });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    if (eventId) {
      query = query.eq('event_id', eventId);
    }
    if (status) {
      query = query.eq('status', status as any);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      organization_id, event_id, name, description, call_time, end_time,
      location, dress_code, meal_provided, notes
    } = body;

    if (!organization_id || !event_id || !name || !call_time) {
      return NextResponse.json({ 
        error: 'organization_id, event_id, name, and call_time are required' 
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('crew_calls')
      .insert({
        organization_id,
        event_id,
        name,
        description,
        call_time,
        end_time,
        location,
        dress_code,
        meal_provided: meal_provided || false,
        notes,
        status: 'draft',
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
