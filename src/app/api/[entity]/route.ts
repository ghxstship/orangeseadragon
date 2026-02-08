import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiPaginated, apiCreated, badRequest, supabaseError } from '@/lib/api/response';

const normalizeEntity = (entity: string) => entity.replace(/-/g, '_');

/**
 * GENERIC ENTITY LIST API
 * 
 * Handles GET (list) and POST (create) for any entity.
 * Uses service role client to bypass RLS for server-side operations.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ entity: string }> }
) {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { supabase } = auth;
    const { entity } = await params;
    const tableName = normalizeEntity(entity);

    // Use the entity name as the table name
    let query = supabase.from(tableName).select('*', { count: 'exact' });

    const searchParams = request.nextUrl.searchParams;
    const where = searchParams.get('where');
    const orderBy = searchParams.get('orderBy');
    const page = searchParams.get('page');
    const pageSize = searchParams.get('pageSize');
    const search = searchParams.get('search');

    // Basic filtering
    if (where) {
        try {
            const filters = JSON.parse(where);
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    query = query.eq(key, value);
                }
            });
        } catch (e) {
            console.error('Failed to parse where filter:', e);
        }
    }

    // Search (simulated simple search on name if it exists)
    if (search) {
        query = query.ilike('name', `%${search}%`);
    }

    // Sorting
    if (orderBy) {
        try {
            const { field, direction } = JSON.parse(orderBy);
            query = query.order(field, { ascending: direction === 'asc' });
        } catch (e) {
            console.error('Failed to parse orderBy:', e);
        }
    } else {
        // Default sort by created_at if not specified
        query = query.order('created_at', { ascending: false });
    }

    // Pagination
    if (page && pageSize) {
        const p = parseInt(page);
        const ps = parseInt(pageSize);
        if (!isNaN(p) && !isNaN(ps)) {
            query = query.range((p - 1) * ps, p * ps - 1);
        }
    }

    const { data, error, count } = await query;

    if (error) {
        return supabaseError(error);
    }

    const p = page ? parseInt(page) : 1;
    const ps = pageSize ? parseInt(pageSize) : (data?.length || 0);

    return apiPaginated(data || [], {
        page: p,
        limit: ps,
        total: count || 0,
    });
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ entity: string }> }
) {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { supabase } = auth;
    const { entity } = await params;
    const tableName = normalizeEntity(entity);

    try {
        const body = await request.json();
        console.log(`[API POST] Entity: ${entity}, Body:`, JSON.stringify(body, null, 2));
        
        const { data, error } = await supabase.from(tableName).insert(body).select().single();

        if (error) {
            console.error(`[API POST] Supabase error for ${entity}:`, error);
            return supabaseError(error);
        }

        return apiCreated(data);
    } catch (e) {
        console.error(`[API POST] Exception for ${entity}:`, e);
        return badRequest('Invalid request body');
    }
}
