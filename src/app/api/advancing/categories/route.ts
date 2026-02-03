import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createServiceClient();
  const searchParams = request.nextUrl.searchParams;

  const parentCode = searchParams.get('parentCode');
  const isActive = searchParams.get('isActive');
  const includeChildren = searchParams.get('includeChildren') === 'true';

  let query = supabase
    .from('advance_categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (isActive !== null) {
    query = query.eq('is_active', isActive === 'true');
  }

  // Filter by parent code prefix
  if (parentCode) {
    if (includeChildren) {
      query = query.ilike('code', `${parentCode}%`);
    } else {
      query = query.eq('code', parentCode);
    }
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Build hierarchical structure if requested
  if (includeChildren && data) {
    const topLevel = data.filter(c => !c.parent_category_id);
    const buildTree = (categories: typeof data, parentId: string | null): typeof data => {
      return categories
        .filter(c => c.parent_category_id === parentId)
        .map(c => ({
          ...c,
          children: buildTree(categories, c.id),
        }));
    };
    
    return NextResponse.json({
      records: buildTree(data, null),
      flat: data,
      topLevel,
    });
  }

  return NextResponse.json({
    records: data,
    total: data?.length || 0,
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createServiceClient();

  try {
    const body = await request.json();

    const insertData = {
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('advance_categories')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
