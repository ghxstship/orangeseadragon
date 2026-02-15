// /app/api/comments/route.ts
// Comments API for entity detail tabs

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;

  const entityId = request.nextUrl.searchParams.get('entityId');
  if (!entityId) {
    return apiSuccess({ items: [] });
  }

  try {
    const { data, error } = await supabase
      .from('comments')
      .select('id, body, created_at, updated_at, author:users!comments_user_id_fkey(id, full_name, avatar_url)')
      .eq('entity_id', entityId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      return supabaseError(error);
    }

    const items = (data || []).map((row: Record<string, unknown>) => {
      const authorArr = row.author as Array<{ full_name?: string; avatar_url?: string | null }> | null;
      const author = Array.isArray(authorArr) ? authorArr[0] : authorArr;
      return {
        id: row.id as string,
        author: author?.full_name || 'Unknown',
        avatarUrl: author?.avatar_url || undefined,
        body: row.body as string,
        createdAt: row.created_at as string,
        updatedAt: (row.updated_at as string | null) || undefined,
      };
    });

    return apiSuccess({ items });
  } catch (err) {
    console.error('[Comments API] GET error:', err);
    return serverError('Failed to fetch comments');
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase, user } = auth;

  try {
    const { entityId, body } = await request.json();

    if (!entityId || !body?.trim()) {
      return new Response(JSON.stringify({ error: 'entityId and body are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        entity_id: entityId,
        user_id: user.id,
        body: body.trim(),
      })
      .select('id')
      .single();

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess({ id: data.id });
  } catch (err) {
    console.error('[Comments API] POST error:', err);
    return serverError('Failed to create comment');
  }
}
