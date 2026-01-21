// @ts-nocheck
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
    const offset = (page - 1) * limit;

    let query = supabase
      .from('organizations')
      .select('*, organization_members!inner(user_id)', { count: 'exact' })
      .eq('organization_members.user_id', user.id)
      .is('deleted_at', null)
      .range(offset, offset + limit - 1)
      .order('name', { ascending: true });

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
    const { name, slug, description, logo_url, website, email, phone, address, city, state, country, postal_code, timezone, currency, locale } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name,
        slug,
        description,
        logo_url,
        website,
        email,
        phone,
        address,
        city,
        state,
        country,
        postal_code,
        timezone: timezone || 'UTC',
        currency: currency || 'USD',
        locale: locale || 'en-US',
        subscription_tier: 'core',
        subscription_status: 'trialing',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (orgError) {
      return NextResponse.json({ error: orgError.message }, { status: 500 });
    }

    // First create a default owner role for the organization
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .insert({
        organization_id: org.id,
        name: 'Owner',
        slug: 'owner',
        description: 'Organization owner with full access',
        level: 100,
        tier: 'core',
        is_system: true,
        permissions: { '*': true },
      })
      .select()
      .single();

    if (roleError) {
      await supabase.from('organizations').delete().eq('id', org.id);
      return NextResponse.json({ error: roleError.message }, { status: 500 });
    }

    // Create owner membership
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: org.id,
        user_id: user.id,
        role_id: role.id,
        is_owner: true,
        status: 'active',
      });

    if (memberError) {
      await supabase.from('organizations').delete().eq('id', org.id);
      return NextResponse.json({ error: memberError.message }, { status: 500 });
    }

    return NextResponse.json({ data: org }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
