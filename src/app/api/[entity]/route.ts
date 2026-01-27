import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GENERIC ENTITY LIST API
 * 
 * Handles GET (list) and POST (create) for any entity.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { entity: string } }
) {
    const supabase = await createClient();
    const { entity } = params;

    // Use the entity name as the table name
    let query = (supabase as any).from(entity).select('*', { count: 'exact' });

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
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        records: data,
        total: count || 0,
        page: page ? parseInt(page) : 1,
        pageSize: pageSize ? parseInt(pageSize) : (data?.length || 0)
    });
}

export async function POST(
    request: NextRequest,
    { params }: { params: { entity: string } }
) {
    const supabase = await createClient();
    const { entity } = params;

    try {
        const body = await request.json();
        const { data, error } = await (supabase as any).from(entity).insert(body).select().single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (e) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}
