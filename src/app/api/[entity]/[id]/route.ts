import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, apiNoContent, notFound, badRequest, supabaseError } from '@/lib/api/response';

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
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { supabase } = auth;
    const { entity, id } = await params;
    const tableName = normalizeEntity(entity);

    const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

    if (error) {
        return error.code === 'PGRST116' ? notFound(tableName) : supabaseError(error);
    }

    return apiSuccess(data);
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ entity: string; id: string }> }
) {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { supabase } = auth;
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
            return supabaseError(error);
        }

        return apiSuccess(data);
    } catch (error) {
        console.error('Invalid request body', error);
        return badRequest('Invalid request body');
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ entity: string; id: string }> }
) {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { supabase } = auth;
    const { entity, id } = await params;
    const tableName = normalizeEntity(entity);

    // Soft delete: set deleted_at timestamp instead of hard delete
    const { data, error } = await supabase
        .from(tableName)
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        // Fallback to hard delete for tables without deleted_at column
        if (error.message?.includes('deleted_at')) {
            const { error: hardDeleteError } = await supabase
                .from(tableName)
                .delete()
                .eq('id', id);

            if (hardDeleteError) {
                return supabaseError(hardDeleteError);
            }
            return apiNoContent();
        }
        return supabaseError(error);
    }

    return apiSuccess(data, { message: 'Record archived' });
}
