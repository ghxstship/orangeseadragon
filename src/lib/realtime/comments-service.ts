/**
 * Comments Service
 * 
 * Polymorphic comments system that can be attached to any entity.
 * Supports threaded replies, @mentions, and attachments.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { EntityType, Comment, CommentAttachment } from './types';

export interface CreateCommentOptions {
  organizationId: string;
  entityType: EntityType;
  entityId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  content: string;
  parentId?: string;
  mentions?: string[];
  attachments?: CommentAttachment[];
}

export interface UpdateCommentOptions {
  content: string;
  mentions?: string[];
}

export class CommentsService {
  private supabase: SupabaseClient<Database>;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
  }

  /**
   * Create a new comment
   */
  async createComment(options: CreateCommentOptions): Promise<Comment> {
    const { data, error } = await this.supabase
      .from('entity_comments')
      .insert({
        organization_id: options.organizationId,
        entity_type: options.entityType,
        entity_id: options.entityId,
        author_id: options.authorId,
        author_name: options.authorName,
        author_avatar_url: options.authorAvatarUrl,
        content: options.content,
        parent_id: options.parentId,
        mentions: options.mentions ?? [],
        attachments: options.attachments as unknown as Database['public']['Tables']['entity_comments']['Insert']['attachments'],
        is_edited: false,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create comment: ${error.message}`);
    }

    // Create notifications for mentioned users
    if (options.mentions && options.mentions.length > 0) {
      await this.notifyMentionedUsers(
        options.organizationId,
        options.mentions,
        options.authorName,
        options.entityType,
        options.entityId,
        data.id
      );
    }

    return this.mapComment(data);
  }

  /**
   * Get comments for an entity
   */
  async getComments(
    organizationId: string,
    entityType: EntityType,
    entityId: string,
    includeReplies: boolean = true
  ): Promise<Comment[]> {
    let query = this.supabase
      .from('entity_comments')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: true });

    if (!includeReplies) {
      query = query.is('parent_id', null);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get comments: ${error.message}`);
    }

    return (data ?? []).map(this.mapComment);
  }

  /**
   * Get threaded comments (organized by parent)
   */
  async getThreadedComments(
    organizationId: string,
    entityType: EntityType,
    entityId: string
  ): Promise<{ comments: Comment[]; threads: Map<string, Comment[]> }> {
    const allComments = await this.getComments(organizationId, entityType, entityId, true);

    const rootComments: Comment[] = [];
    const threads = new Map<string, Comment[]>();

    for (const comment of allComments) {
      if (!comment.parentId) {
        rootComments.push(comment);
      } else {
        if (!threads.has(comment.parentId)) {
          threads.set(comment.parentId, []);
        }
        threads.get(comment.parentId)!.push(comment);
      }
    }

    return { comments: rootComments, threads };
  }

  /**
   * Update a comment
   */
  async updateComment(
    commentId: string,
    options: UpdateCommentOptions
  ): Promise<Comment> {
    const { data, error } = await this.supabase
      .from('entity_comments')
      .update({
        content: options.content,
        mentions: options.mentions,
        is_edited: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update comment: ${error.message}`);
    }

    return this.mapComment(data);
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<void> {
    const { error } = await this.supabase
      .from('entity_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      throw new Error(`Failed to delete comment: ${error.message}`);
    }
  }

  /**
   * Get comment count for an entity
   */
  async getCommentCount(
    organizationId: string,
    entityType: EntityType,
    entityId: string
  ): Promise<number> {
    const { count, error } = await this.supabase
      .from('entity_comments')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId);

    if (error) {
      throw new Error(`Failed to get comment count: ${error.message}`);
    }

    return count ?? 0;
  }

  /**
   * Parse @mentions from content
   */
  static parseMentions(content: string): string[] {
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      if (match[2]) mentions.push(match[2]); // User ID
    }

    return mentions;
  }

  /**
   * Format content with mentions for display
   */
  static formatMentions(content: string): string {
    return content.replace(
      /@\[([^\]]+)\]\(([^)]+)\)/g,
      (_, name) => `<span class="mention">@${name}</span>`
    );
  }

  /**
   * Notify mentioned users
   */
  private async notifyMentionedUsers(
    organizationId: string,
    userIds: string[],
    authorName: string,
    entityType: EntityType,
    entityId: string,
    commentId: string
  ): Promise<void> {
    const notifications = userIds.map((userId) => ({
      type: 'mention',
      title: `${authorName} mentioned you`,
      message: `You were mentioned in a comment on a ${entityType.replace('_', ' ')}`,
      user_id: userId,
      organization_id: organizationId,
      entity_type: entityType,
      entity_id: entityId,
      data: {
        commentId,
        url: `/${entityType.replace('_', '-')}s/${entityId}#comment-${commentId}`,
      },
      is_read: false,
    }));

    await this.supabase.from('notifications').insert(notifications);
  }

  /**
   * Map database row to Comment
   */
  private mapComment(data: Record<string, unknown>): Comment {
    return {
      id: data.id as string,
      organizationId: data.organization_id as string,
      entityType: data.entity_type as EntityType,
      entityId: data.entity_id as string,
      parentId: data.parent_id as string | undefined,
      authorId: data.author_id as string,
      authorName: data.author_name as string,
      authorAvatarUrl: data.author_avatar_url as string | undefined,
      content: data.content as string,
      mentions: (data.mentions as string[]) ?? [],
      attachments: data.attachments as CommentAttachment[] | undefined,
      isEdited: data.is_edited as boolean,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }
}

// Singleton instance
let commentsServiceInstance: CommentsService | null = null;

export function getCommentsService(): CommentsService {
  if (!commentsServiceInstance) {
    commentsServiceInstance = new CommentsService();
  }
  return commentsServiceInstance;
}
