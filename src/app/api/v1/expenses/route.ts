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
    const categoryId = searchParams.get('category_id');
    const organizationId = searchParams.get('organization_id');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('expenses')
      .select('*, user:users(id, full_name, email), category:budget_categories(id, name)', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('expense_date', { ascending: false });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    if (categoryId) {
      query = query.eq('category_id', categoryId);
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
      organization_id, project_id, event_id, category_id, description,
      amount, currency, expense_date, vendor, receipt_url, is_billable, notes
    } = body;

    if (!organization_id || !description || !amount) {
      return NextResponse.json({ 
        error: 'organization_id, description, and amount are required' 
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        organization_id,
        project_id,
        event_id,
        category_id,
        user_id: user.id,
        description,
        amount,
        currency: currency || 'USD',
        expense_date: expense_date || new Date().toISOString(),
        vendor,
        receipt_url,
        is_billable: is_billable || false,
        notes,
        status: 'pending',
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
