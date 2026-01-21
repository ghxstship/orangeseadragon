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
    const companyId = searchParams.get('company_id');
    const organizationId = searchParams.get('organization_id');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('contacts')
      .select('*, company:companies(id, name)', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('last_name', { ascending: true });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    if (companyId) {
      query = query.eq('company_id', companyId);
    }
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
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
      organization_id, company_id, first_name, last_name, email, phone,
      mobile, job_title, department, address, city, state, country,
      postal_code, linkedin_url, twitter_handle, avatar_url, notes, tags
    } = body;

    if (!organization_id || !first_name || !last_name) {
      return NextResponse.json({ 
        error: 'organization_id, first_name, and last_name are required' 
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('contacts')
      .insert({
        organization_id,
        company_id,
        first_name,
        last_name,
        email,
        phone,
        mobile,
        job_title,
        department,
        address,
        city,
        state,
        country,
        postal_code,
        linkedin_url,
        twitter_handle,
        avatar_url,
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
