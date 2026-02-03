import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const normalizeEntity = (entity: string) => entity.replace(/-/g, '_');

/**
 * GENERIC ENTITY RECORD API
 * 
 * Handles GET (single), PATCH (update), and DELETE for any entity record.
 * Uses service role client to bypass RLS for server-side operations.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ entity: string; id: string }> }
) {
    const supabase = await createServiceClient();
    const { entity, id } = await params;
    const tableName = normalizeEntity(entity);

    const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: error.code === 'PGRST116' ? 404 : 500 });
    }

    return NextResponse.json(data);
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ entity: string; id: string }> }
) {
    const supabase = await createServiceClient();
    const { entity, id } = await params;
    const tableName = normalizeEntity(entity);

    try {
        const body = await request.json();
        const { data, error } = await supabase
            .from(tableName)
            .update(body)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Invalid request body', error);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ entity: string; id: string }> }
) {
    const supabase = await createServiceClient();
    const { entity, id } = await params;
    const tableName = normalizeEntity(entity);

    const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
