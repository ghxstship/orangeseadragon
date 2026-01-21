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
    const offset = (page - 1) * limit;

    let query = supabase
      .from('purchase_orders')
      .select('*, company:companies(id, name)', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    if (status) {
      query = query.eq('status', status as any);
    }
    if (search) {
      query = query.ilike('po_number', `%${search}%`);
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
      organization_id, company_id, project_id, event_id, po_number,
      subtotal, tax_amount, shipping_amount, total_amount, currency,
      delivery_date, shipping_address, billing_address, payment_terms, notes
    } = body;

    if (!organization_id || !po_number || !total_amount) {
      return NextResponse.json({ 
        error: 'organization_id, po_number, and total_amount are required' 
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('purchase_orders')
      .insert({
        organization_id,
        company_id,
        project_id,
        event_id,
        po_number,
        subtotal: subtotal || total_amount,
        tax_amount: tax_amount || 0,
        shipping_amount: shipping_amount || 0,
        total_amount,
        currency: currency || 'USD',
        delivery_date,
        shipping_address: shipping_address || {},
        billing_address: billing_address || {},
        payment_terms,
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
