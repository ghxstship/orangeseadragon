import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GENERIC ENTITY RECORD API
 * 
 * Handles GET (single), PATCH (update), and DELETE for any entity record.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { entity: string; id: string } }
) {
    const supabase = await createClient();
    const { entity, id } = params;

    const { data, error } = await (supabase as any)
        .from(entity)
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
    { params }: { params: { entity: string; id: string } }
) {
    const supabase = await createClient();
    const { entity, id } = params;

    try {
        const body = await request.json();
        const { data, error } = await (supabase as any)
            .from(entity)
            .update(body)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (e) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { entity: string; id: string } }
) {
    const supabase = await createClient();
    const { entity, id } = params;

    const { error } = await (supabase as any)
        .from(entity)
        .delete()
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
