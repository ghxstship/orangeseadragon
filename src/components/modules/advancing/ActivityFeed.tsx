'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { 
  Activity,
  MessageSquare,
  Edit,
  Plus,
  Trash2,
  UserPlus,
  CheckCircle,
  XCircle,
  ArrowRight,
  Clock,
  Loader2,
  Send,
  MoreHorizontal,
  Reply
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';

interface ActivityEvent {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  actor_id?: string;
  actor_name?: string;
  field_changes?: Array<{ field: string; from: string; to: string }>;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  created_at: string;
  metadata?: Record<string, unknown>;
}

interface Comment {
  id: string;
  author_id: string;
  author?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  content: string;
  content_html?: string;
  mentions?: string[];
  is_edited?: boolean;
  is_resolved?: boolean;
  reply_count?: number;
  created_at: string;
  updated_at?: string;
}

interface ActivityFeedProps {
  entityType: string;
  entityId: string;
  className?: string;
}

const actionIcons: Record<string, React.ElementType> = {
  created: Plus,
  updated: Edit,
  deleted: Trash2,
  status_changed: ArrowRight,
  assigned: UserPlus,
  completed: CheckCircle,
  rejected: XCircle,
  commented: MessageSquare,
};

const actionLabels: Record<string, string> = {
  created: 'created',
  updated: 'updated',
  deleted: 'deleted',
  status_changed: 'changed status',
  assigned: 'assigned',
  unassigned: 'unassigned',
  completed: 'completed',
  rejected: 'rejected',
  commented: 'commented on',
  approved: 'approved',
  reopened: 'reopened',
};

function ActivityItem({ activity }: { activity: ActivityEvent }) {
  const Icon = actionIcons[activity.action] || Activity;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 py-3"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium">{activity.actor_name || 'System'}</span>
          {' '}
          <span className="text-muted-foreground">
            {actionLabels[activity.action] || activity.action}
          </span>
          {' '}
          <span className="text-muted-foreground">this item</span>
        </p>
        
        {activity.field_changes && activity.field_changes.length > 0 && (
          <div className="mt-1 space-y-1">
            {activity.field_changes.map((change, idx) => (
              <div key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="font-medium">{change.field}:</span>
                <Badge variant="outline" className="text-[10px] px-1">
                  {String(change.from || 'empty')}
                </Badge>
                <ArrowRight className="h-3 w-3" />
                <Badge variant="secondary" className="text-[10px] px-1">
                  {String(change.to || 'empty')}
                </Badge>
              </div>
            ))}
          </div>
        )}
        
        <p className="text-xs text-muted-foreground mt-1">
          <Clock className="h-3 w-3 inline mr-1" />
          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
        </p>
      </div>
    </motion.div>
  );
}

function CommentItem({ 
  comment, 
  onReply,
  onResolve,
  onDelete,
  currentUserId
}: { 
  comment: Comment;
  onReply: (commentId: string) => void;
  onResolve: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  currentUserId?: string;
}) {
  const isOwner = currentUserId === comment.author_id;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3 py-3",
        comment.is_resolved && "opacity-60"
      )}
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={comment.author?.avatar_url} />
        <AvatarFallback>
          {comment.author?.full_name?.charAt(0) || 'U'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            {comment.author?.full_name || 'Unknown User'}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
          {comment.is_edited && (
            <span className="text-xs text-muted-foreground">(edited)</span>
          )}
          {comment.is_resolved && (
            <Badge variant="secondary" className="text-[10px]">Resolved</Badge>
          )}
        </div>
        
        <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
        
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => onReply(comment.id)}
          >
            <Reply className="h-3 w-3 mr-1" />
            Reply
            {comment.reply_count ? ` (${comment.reply_count})` : ''}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {!comment.is_resolved && (
                <DropdownMenuItem onClick={() => onResolve(comment.id)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as resolved
                </DropdownMenuItem>
              )}
              {isOwner && (
                <DropdownMenuItem 
                  onClick={() => onDelete(comment.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
}

export function ActivityFeed({ entityType, entityId, className }: ActivityFeedProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    
    try {
      const [activityRes, commentsRes] = await Promise.all([
        fetch(`/api/advancing/activity?entityType=${entityType}&entityId=${entityId}`),
        fetch(`/api/advancing/comments?entityType=${entityType}&entityId=${entityId}`),
      ]);
      
      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setActivities(activityData.records || []);
      }
      
      if (commentsRes.ok) {
        const commentsData = await commentsRes.json();
        setComments(commentsData.records || []);
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;
    
    setSubmitting(true);
    
    try {
      const res = await fetch('/api/advancing/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          entityId,
          content: newComment,
          parentCommentId: replyingTo,
        }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to post comment');
      }
      
      const data = await res.json();
      setComments(prev => [...prev, data.data]);
      setNewComment('');
      setReplyingTo(null);
      
      toast({
        title: 'Comment posted',
        description: 'Your comment has been added.',
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to post comment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveComment = async (commentId: string) => {
    try {
      const res = await fetch('/api/advancing/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId,
          action: 'resolve',
        }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to resolve comment');
      }
      
      setComments(prev => 
        prev.map(c => c.id === commentId ? { ...c, is_resolved: true } : c)
      );
    } catch (error) {
      console.error('Error resolving comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch('/api/advancing/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId,
          action: 'delete',
        }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete comment');
      }
      
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const allItems = [
    ...activities.map(a => ({ type: 'activity' as const, data: a, date: a.created_at })),
    ...comments.map(c => ({ type: 'comment' as const, data: c, date: c.created_at })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList variant="underline" className="px-4">
          <TabsTrigger value="all">
            All ({allItems.length})
          </TabsTrigger>
          <TabsTrigger value="comments">
            Comments ({comments.length})
          </TabsTrigger>
          <TabsTrigger value="activity">
            Activity ({activities.length})
          </TabsTrigger>
        </TabsList>
        
        <ScrollArea className="flex-1">
          <div className="px-4 divide-y">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <TabsContent value="all" className="m-0">
                  {allItems.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No activity yet</p>
                    </div>
                  ) : (
                    allItems.map(item => (
                      item.type === 'activity' ? (
                        <ActivityItem key={`activity-${item.data.id}`} activity={item.data as ActivityEvent} />
                      ) : (
                        <CommentItem
                          key={`comment-${item.data.id}`}
                          comment={item.data as Comment}
                          onReply={setReplyingTo}
                          onResolve={handleResolveComment}
                          onDelete={handleDeleteComment}
                        />
                      )
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="comments" className="m-0">
                  {comments.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No comments yet</p>
                    </div>
                  ) : (
                    comments.map(comment => (
                      <CommentItem
                        key={comment.id}
                        comment={comment}
                        onReply={setReplyingTo}
                        onResolve={handleResolveComment}
                        onDelete={handleDeleteComment}
                      />
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="activity" className="m-0">
                  {activities.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No activity yet</p>
                    </div>
                  ) : (
                    activities.map(activity => (
                      <ActivityItem key={activity.id} activity={activity} />
                    ))
                  )}
                </TabsContent>
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>
      </Tabs>
      
      {/* Comment input */}
      <form onSubmit={handleSubmitComment} className="p-4 border-t">
        {replyingTo && (
          <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
            <Reply className="h-3 w-3" />
            <span>Replying to comment</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-5 px-1"
              onClick={() => setReplyingTo(null)}
            >
              Cancel
            </Button>
          </div>
        )}
        
        <div className="flex gap-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={1}
            className="min-h-[40px] resize-none"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!newComment.trim() || submitting}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
