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
    const talentType = searchParams.get('talent_type');
    const organizationId = searchParams.get('organization_id');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('talent_profiles')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('stage_name', { ascending: true });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    if (talentType) {
      query = query.eq('talent_type', talentType as any);
    }
    if (search) {
      query = query.or(`stage_name.ilike.%${search}%,legal_name.ilike.%${search}%`);
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
      organization_id, stage_name, legal_name, talent_type, bio, genres,
      email, phone, manager_name, manager_email, manager_phone, agent_name,
      agent_email, agent_phone, website, social_links, image_url, press_kit_url,
      technical_requirements, hospitality_requirements, fee_range_min, fee_range_max,
      currency, notes, tags
    } = body;

    if (!organization_id || !stage_name) {
      return NextResponse.json({ 
        error: 'organization_id and stage_name are required' 
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('talent_profiles')
      .insert({
        organization_id,
        stage_name,
        legal_name,
        talent_type: talent_type || 'artist',
        bio,
        genres: genres || [],
        email,
        phone,
        manager_name,
        manager_email,
        manager_phone,
        agent_name,
        agent_email,
        agent_phone,
        website,
        social_links: social_links || {},
        image_url,
        press_kit_url,
        technical_requirements,
        hospitality_requirements,
        fee_range_min,
        fee_range_max,
        currency: currency || 'USD',
        notes,
        tags: tags || [],
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
