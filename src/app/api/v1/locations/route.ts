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
    const search = searchParams.get('search') || '';
    const locationType = searchParams.get('location_type');
    const organizationId = searchParams.get('organization_id');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('locations')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('name', { ascending: true });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    if (locationType) {
      query = query.eq('location_type', locationType as any);
    }
    if (search) {
      query = query.ilike('name', `%${search}%`);
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
      organization_id, parent_id, name, description, location_type,
      address, city, state, country, postal_code, latitude, longitude,
      capacity, contact_name, contact_phone, contact_email, notes
    } = body;

    if (!organization_id || !name) {
      return NextResponse.json({ error: 'organization_id and name are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('locations')
      .insert({
        organization_id,
        parent_id,
        name,
        description,
        location_type: location_type || 'warehouse',
        address,
        city,
        state,
        country,
        postal_code,
        latitude,
        longitude,
        capacity,
        contact_name,
        contact_phone,
        contact_email,
        notes,
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
