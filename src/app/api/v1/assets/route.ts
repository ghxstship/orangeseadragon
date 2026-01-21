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
    const categoryId = searchParams.get('category_id');
    const locationId = searchParams.get('location_id');
    const organizationId = searchParams.get('organization_id');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('assets')
      .select('*, category:asset_categories(id, name), location:locations(id, name)', { count: 'exact' })
      .is('deleted_at', null)
      .range(offset, offset + limit - 1)
      .order('name', { ascending: true });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    if (locationId) {
      query = query.eq('location_id', locationId);
    }
    if (status) {
      query = query.eq('status', status as any);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,asset_tag.ilike.%${search}%,serial_number.ilike.%${search}%`);
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
      organization_id, category_id, location_id, asset_tag, serial_number,
      name, description, manufacturer, model, status, condition,
      purchase_date, purchase_price, purchase_currency, warranty_expires,
      qr_code, barcode, rfid_tag, image_url, specifications, notes
    } = body;

    if (!organization_id || !category_id || !asset_tag || !name) {
      return NextResponse.json({ 
        error: 'organization_id, category_id, asset_tag, and name are required' 
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('assets')
      .insert({
        organization_id,
        category_id,
        location_id,
        asset_tag,
        serial_number,
        name,
        description,
        manufacturer,
        model,
        status: status || 'available',
        condition: condition || 'good',
        purchase_date,
        purchase_price,
        purchase_currency: purchase_currency || 'USD',
        warranty_expires,
        qr_code,
        barcode,
        rfid_tag,
        image_url,
        specifications: specifications || {},
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
