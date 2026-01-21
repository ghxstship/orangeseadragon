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
    const userId = searchParams.get('user_id');
    const organizationId = searchParams.get('organization_id');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('timesheets')
      .select('*, user:users(id, full_name, email)', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('period_start', { ascending: false });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    if (userId) {
      query = query.eq('user_id', userId);
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
      organization_id, period_start, period_end, total_hours, 
      regular_hours, overtime_hours, notes
    } = body;

    if (!organization_id || !period_start || !period_end) {
      return NextResponse.json({ 
        error: 'organization_id, period_start, and period_end are required' 
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('timesheets')
      .insert({
        organization_id,
        user_id: user.id,
        period_start,
        period_end,
        total_hours: total_hours || 0,
        regular_hours: regular_hours || 0,
        overtime_hours: overtime_hours || 0,
        notes,
        status: 'draft',
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
