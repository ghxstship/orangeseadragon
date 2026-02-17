import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, supabaseError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;
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
    return supabaseError(error);
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
    
    return apiSuccess(buildTree(data, null), { flat: data, topLevel });
  }

  return apiSuccess(data, { total: data?.length || 0 });
}

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;

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
      return supabaseError(error);
    }

    return apiCreated(data);
  } catch {
    return badRequest('Invalid request body');
  }
}
