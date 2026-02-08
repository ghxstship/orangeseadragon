import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, notFound, forbidden, supabaseError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;
  const searchParams = request.nextUrl.searchParams;
  
  const entityType = searchParams.get('entityType');
  const entityId = searchParams.get('entityId');
  const parentCommentId = searchParams.get('parentCommentId');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '50');
  
  if (!entityType || !entityId) {
    return badRequest('entityType and entityId are required');
  }
  
  let query = supabase
    .from('comments')
    .select(`
      *,
      author:users!comments_author_id_fkey(id, full_name, avatar_url),
      resolver:users!comments_resolved_by_fkey(id, full_name)
    `, { count: 'exact' })
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .is('deleted_at', null);
  
  if (parentCommentId) {
    query = query.eq('parent_comment_id', parentCommentId);
  } else {
    query = query.is('parent_comment_id', null);
  }
  
  query = query
    .order('created_at', { ascending: true })
    .range((page - 1) * pageSize, page * pageSize - 1);
  
  const { data, error, count } = await query;
  
  if (error) {
    return supabaseError(error);
  }
  
  // For each top-level comment, get reply count
  const commentsWithReplies = await Promise.all(
    (data || []).map(async (comment) => {
      const { count: replyCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('parent_comment_id', comment.id)
        .is('deleted_at', null);
      
      return {
        ...comment,
        reply_count: replyCount || 0,
      };
    })
  );
  
  return apiSuccess({
    records: commentsWithReplies,
    total: count || 0,
    page,
    pageSize,
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;
  
  try {
    const body = await request.json();
    const { 
      entityType, 
      entityId, 
      content, 
      contentHtml,
      parentCommentId,
      mentions,
      attachments 
    } = body;
    
    if (!entityType || !entityId || !content) {
      return badRequest('entityType, entityId, and content are required');
    }
    
    const userId = user.id;
    
    // Get organization ID from the entity
    let orgId: string | null = null;
    
    if (entityType === 'advance_item') {
      const { data: item } = await supabase
        .from('advance_items')
        .select('organization_id')
        .eq('id', entityId)
        .single();
      orgId = item?.organization_id;
    } else if (entityType === 'production_advance') {
      const { data: advance } = await supabase
        .from('production_advances')
        .select('organization_id')
        .eq('id', entityId)
        .single();
      orgId = advance?.organization_id;
    }
    
    if (!orgId) {
      return badRequest('Could not determine organization');
    }
    
    const { data, error } = await supabase
      .from('comments')
      .insert({
        organization_id: orgId,
        entity_type: entityType,
        entity_id: entityId,
        parent_comment_id: parentCommentId,
        author_id: userId,
        content,
        content_html: contentHtml,
        mentions: mentions || [],
        attachments: attachments || [],
      })
      .select(`
        *,
        author:users!comments_author_id_fkey(id, full_name, avatar_url)
      `)
      .single();
    
    if (error) {
      return supabaseError(error);
    }
    
    // Update comment count on the advance if applicable
    if (entityType === 'production_advance') {
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('entity_type', 'production_advance')
        .eq('entity_id', entityId)
        .is('deleted_at', null);
      
      await supabase
        .from('production_advances')
        .update({ comment_count: count || 0 })
        .eq('id', entityId);
    }
    
    // Create activity event
    await supabase
      .from('activity_events')
      .insert({
        organization_id: orgId,
        entity_type: entityType,
        entity_id: entityId,
        action: 'commented',
        actor_id: userId,
        metadata: { comment_id: data.id },
      });
    
    // Create notifications for mentioned users
    if (mentions && mentions.length > 0) {
      const notifications = mentions.map((mentionedUserId: string) => ({
        user_id: mentionedUserId,
        type: 'mention',
        title: 'You were mentioned in a comment',
        message: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
        data: {
          entity_type: entityType,
          entity_id: entityId,
          comment_id: data.id,
          actionUrl: `/advancing/${entityType === 'production_advance' ? 'advances' : 'items'}/${entityId}`,
        },
      }));
      
      await supabase.from('notifications').insert(notifications);
    }
    
    return apiCreated(data);
  } catch {
    return badRequest('Invalid request body');
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;
  
  try {
    const body = await request.json();
    const { commentId, content, contentHtml, action } = body;
    
    if (!commentId) {
      return badRequest('commentId is required');
    }
    
    const userId = user.id;
    
    // Verify ownership
    const { data: comment } = await supabase
      .from('comments')
      .select('author_id')
      .eq('id', commentId)
      .single();
    
    if (!comment) {
      return notFound('Comment not found');
    }
    
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    
    if (action === 'resolve') {
      updateData.is_resolved = true;
      updateData.resolved_by = userId;
      updateData.resolved_at = new Date().toISOString();
    } else if (action === 'unresolve') {
      updateData.is_resolved = false;
      updateData.resolved_by = null;
      updateData.resolved_at = null;
    } else if (action === 'delete') {
      if (comment.author_id !== userId) {
        return forbidden('Not authorized to delete this comment');
      }
      updateData.deleted_at = new Date().toISOString();
    } else if (content) {
      if (comment.author_id !== userId) {
        return forbidden('Not authorized to edit this comment');
      }
      updateData.content = content;
      updateData.content_html = contentHtml;
      updateData.is_edited = true;
    }
    
    const { data, error } = await supabase
      .from('comments')
      .update(updateData)
      .eq('id', commentId)
      .select()
      .single();
    
    if (error) {
      return supabaseError(error);
    }
    
    return apiSuccess(data);
  } catch {
    return badRequest('Invalid request body');
  }
}
