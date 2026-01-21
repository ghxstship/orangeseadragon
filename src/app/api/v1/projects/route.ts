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
    const status = searchParams.get('status');
    const organizationId = searchParams.get('organization_id');
    const workspaceId = searchParams.get('workspace_id');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('projects')
      .select('*, organization:organizations(id, name, slug)', { count: 'exact' })
      .is('deleted_at', null)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }
    if (status) {
      query = query.eq('status', status as any);
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
      organization_id, workspace_id, parent_id, name, slug, description, 
      status, visibility, priority, color, icon, start_date, end_date,
      budget_amount, budget_currency, settings, metadata 
    } = body;

    if (!organization_id || !name || !slug) {
      return NextResponse.json({ error: 'organization_id, name, and slug are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        organization_id,
        workspace_id,
        parent_id,
        name,
        slug,
        description,
        status: status || 'draft',
        visibility: visibility || 'team',
        priority: priority || 'medium',
        color,
        icon,
        start_date,
        end_date,
        budget_amount,
        budget_currency: budget_currency || 'USD',
        settings: settings || {},
        metadata: metadata || {},
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
