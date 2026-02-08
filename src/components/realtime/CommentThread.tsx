"use client";

import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Reply, Pencil, Trash2, Send, X } from "lucide-react";
import type { Comment } from "@/lib/realtime/types";

interface CommentThreadProps {
  comments: Comment[];
  threads: Map<string, Comment[]>;
  currentUser: { id: string; name: string; avatarUrl?: string };
  onAddComment: (content: string, parentId?: string) => Promise<void>;
  onEditComment: (commentId: string, content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  loading?: boolean;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function CommentThread({
  comments,
  threads,
  currentUser,
  onAddComment,
  onEditComment,
  onDeleteComment,
  loading = false,
  className,
}: CommentThreadProps) {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (parentId?: string) => {
    const content = parentId ? newComment : newComment;
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      await onAddComment(content.trim(), parentId);
      setNewComment("");
      setReplyingTo(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;

    setSubmitting(true);
    try {
      await onEditComment(commentId, editContent.trim());
      setEditingId(null);
      setEditContent("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    await onDeleteComment(commentId);
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  useEffect(() => {
    if (replyingTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyingTo]);

  const renderComment = (comment: Comment, isReply = false) => {
    const isEditing = editingId === comment.id;
    const isOwn = comment.authorId === currentUser.id;
    const replies = threads.get(comment.id) ?? [];

    return (
      <div key={comment.id} className={cn("group", isReply && "ml-10")}>
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={comment.authorAvatarUrl} alt={comment.authorName} />
            <AvatarFallback className="text-xs">
              {getInitials(comment.authorName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{comment.authorName}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
              {comment.isEdited && (
                <span className="text-xs text-muted-foreground">(edited)</span>
              )}
            </div>

            {isEditing ? (
              <div className="mt-2 space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[80px] resize-none"
                  placeholder="Edit your comment..."
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleEdit(comment.id)}
                    disabled={submitting || !editContent.trim()}
                  >
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="mt-1 text-sm whitespace-pre-wrap">{comment.content}</p>

                <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!isReply && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => setReplyingTo(comment.id)}
                    >
                      <Reply className="h-3 w-3 mr-1" />
                      Reply
                    </Button>
                  )}

                  {isOwn && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => startEdit(comment)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(comment.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </>
            )}

            {replyingTo === comment.id && (
              <div className="mt-3 flex gap-2">
                <Textarea
                  ref={textareaRef}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[60px] resize-none flex-1"
                  placeholder={`Reply to ${comment.authorName}...`}
                />
                <div className="flex flex-col gap-1">
                  <Button
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleSubmit(comment.id)}
                    disabled={submitting || !newComment.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => {
                      setReplyingTo(null);
                      setNewComment("");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {replies.length > 0 && (
              <div className="mt-3 space-y-3">
                {replies.map((reply) => renderComment(reply, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/4 rounded bg-muted" />
              <div className="h-12 w-full rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
          <AvatarFallback className="text-xs">
            {getInitials(currentUser.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 flex gap-2">
          <Textarea
            value={replyingTo ? "" : newComment}
            onChange={(e) => !replyingTo && setNewComment(e.target.value)}
            className="min-h-[80px] resize-none flex-1"
            placeholder="Add a comment..."
            disabled={!!replyingTo}
          />
          <Button
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={() => handleSubmit()}
            disabled={submitting || !newComment.trim() || !!replyingTo}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {comments.length > 0 ? (
        <ScrollArea className="max-h-[500px]">
          <div className="space-y-4 pr-4">
            {comments.map((comment) => renderComment(comment))}
          </div>
        </ScrollArea>
      ) : (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No comments yet. Be the first to comment!
        </div>
      )}
    </div>
  );
}

interface CommentCountBadgeProps {
  count: number;
  className?: string;
}

export function CommentCountBadge({ count, className }: CommentCountBadgeProps) {
  if (count === 0) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium",
        className
      )}
    >
      {count} {count === 1 ? "comment" : "comments"}
    </span>
  );
}
