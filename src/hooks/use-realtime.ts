"use client";

/**
 * Real-Time Hooks
 * 
 * React hooks for real-time subscriptions, presence tracking,
 * and activity feeds in the Productions module.
 */

import { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  getRealtimeService, 
  getPresenceService,
  getActivityService,
  getCommentsService,
  type EntityType, 
  type RealtimeEvent, 
  type PresenceState, 
  type ActivityLogEntry,
  type Comment,
} from "@/lib/realtime";

/**
 * Hook for subscribing to real-time entity changes
 */
export function useRealtimeEntity<T = unknown>(
  organizationId: string | null,
  entityType: EntityType,
  entityId?: string
) {
  const queryClient = useQueryClient();
  const [lastEvent, setLastEvent] = useState<RealtimeEvent<T> | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!organizationId) return;

    const service = getRealtimeService();
    
    const subscription = service.subscribeToEntity<T>(
      { organizationId, entityType, entityId },
      (event) => {
        setLastEvent(event);
        setIsConnected(true);

        // Invalidate relevant queries
        if (entityId) {
          queryClient.invalidateQueries({ queryKey: [entityType, entityId] });
        } else {
          queryClient.invalidateQueries({ queryKey: [entityType + 's', organizationId] });
        }
      }
    );

    setIsConnected(true);

    return () => {
      subscription.unsubscribe();
      setIsConnected(false);
    };
  }, [organizationId, entityType, entityId, queryClient]);

  return { lastEvent, isConnected };
}

/**
 * Hook for subscribing to all production-related changes
 */
export function useRealtimeProductions(organizationId: string | null) {
  const queryClient = useQueryClient();
  const [events, setEvents] = useState<(RealtimeEvent & { entityType: EntityType })[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!organizationId) return;

    const service = getRealtimeService();
    
    const subscription = service.subscribeToProductions(
      organizationId,
      (event) => {
        setEvents((prev) => [event, ...prev].slice(0, 50)); // Keep last 50 events
        setIsConnected(true);

        // Invalidate relevant queries
        queryClient.invalidateQueries({ 
          queryKey: [event.entityType + 's', organizationId] 
        });
      }
    );

    setIsConnected(true);

    return () => {
      subscription.unsubscribe();
      setIsConnected(false);
    };
  }, [organizationId, queryClient]);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return { events, isConnected, clearEvents };
}

/**
 * Hook for presence tracking on an entity
 */
export function usePresence(
  organizationId: string | null,
  entityType: EntityType,
  entityId: string | null,
  currentUser: { id: string; name: string; avatarUrl?: string } | null
) {
  const [users, setUsers] = useState<PresenceState[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!organizationId || !entityId || !currentUser) return;

    const service = getPresenceService();
    
    const cleanup = service.join(
      {
        organizationId,
        entityType,
        entityId,
        userId: currentUser.id,
        userName: currentUser.name,
        avatarUrl: currentUser.avatarUrl,
      },
      (presenceUsers) => {
        // Filter out current user from the list
        setUsers(presenceUsers.filter((u) => u.userId !== currentUser.id));
        setIsConnected(true);
      }
    );

    return () => {
      cleanup();
      setIsConnected(false);
    };
  }, [organizationId, entityType, entityId, currentUser]);

  const updatePresence = useCallback(
    async (action: 'viewing' | 'editing', cursor?: { x: number; y: number }) => {
      if (!organizationId || !entityId || !currentUser) return;

      const service = getPresenceService();
      await service.updatePresence(
        {
          organizationId,
          entityType,
          entityId,
          userId: currentUser.id,
          userName: currentUser.name,
          avatarUrl: currentUser.avatarUrl,
        },
        action,
        cursor
      );
    },
    [organizationId, entityType, entityId, currentUser]
  );

  return { users, isConnected, updatePresence };
}

/**
 * Hook for activity feed
 */
export function useActivityFeed(
  organizationId: string | null,
  options?: {
    entityType?: EntityType;
    entityId?: string;
    limit?: number;
  }
) {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);

  const fetchActivities = useCallback(async () => {
    if (!organizationId) {
      setActivities([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const service = getActivityService();
      const result = await service.getActivityLogs(
        organizationId,
        {
          entityType: options?.entityType,
          entityId: options?.entityId,
        },
        options?.limit ?? 50
      );

      setActivities(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch activities'));
    } finally {
      setLoading(false);
    }
  }, [organizationId, options?.entityType, options?.entityId, options?.limit]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!organizationId) return;

    const service = getRealtimeService();
    
    const subscription = service.subscribeToActivityLog(
      organizationId,
      (event) => {
        if (event.new) {
          const newActivity = event.new as ActivityLogEntry;
          
          // Filter by entity if specified
          if (options?.entityType && newActivity.entityType !== options.entityType) {
            return;
          }
          if (options?.entityId && newActivity.entityId !== options.entityId) {
            return;
          }

          setActivities((prev) => [newActivity, ...prev].slice(0, options?.limit ?? 50));
          setTotal((prev) => prev + 1);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [organizationId, options?.entityType, options?.entityId, options?.limit]);

  return { activities, loading, error, total, refetch: fetchActivities };
}

/**
 * Hook for entity comments
 */
export function useComments(
  organizationId: string | null,
  entityType: EntityType,
  entityId: string | null
) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [threads, setThreads] = useState<Map<string, Comment[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [count, setCount] = useState(0);

  const fetchComments = useCallback(async () => {
    if (!organizationId || !entityId) {
      setComments([]);
      setThreads(new Map());
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const service = getCommentsService();
      const result = await service.getThreadedComments(organizationId, entityType, entityId);
      
      setComments(result.comments);
      setThreads(result.threads);
      setCount(result.comments.length + Array.from(result.threads.values()).flat().length);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch comments'));
    } finally {
      setLoading(false);
    }
  }, [organizationId, entityType, entityId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!organizationId || !entityId) return;

    const service = getRealtimeService();
    
    const subscription = service.subscribeToComments(
      organizationId,
      entityType,
      entityId,
      (event) => {
        if (event.eventType === 'INSERT' && event.new) {
          const newComment = event.new as unknown as Comment;
          
          if (newComment.parentId) {
            setThreads((prev) => {
              const newThreads = new Map(prev);
              const thread = newThreads.get(newComment.parentId!) ?? [];
              newThreads.set(newComment.parentId!, [...thread, newComment]);
              return newThreads;
            });
          } else {
            setComments((prev) => [...prev, newComment]);
          }
          setCount((prev) => prev + 1);
        } else if (event.eventType === 'UPDATE' && event.new) {
          const updatedComment = event.new as unknown as Comment;
          
          if (updatedComment.parentId) {
            setThreads((prev) => {
              const newThreads = new Map(prev);
              const thread = newThreads.get(updatedComment.parentId!) ?? [];
              newThreads.set(
                updatedComment.parentId!,
                thread.map((c) => (c.id === updatedComment.id ? updatedComment : c))
              );
              return newThreads;
            });
          } else {
            setComments((prev) =>
              prev.map((c) => (c.id === updatedComment.id ? updatedComment : c))
            );
          }
        } else if (event.eventType === 'DELETE' && event.old) {
          const deletedComment = event.old as unknown as Comment;
          
          if (deletedComment.parentId) {
            setThreads((prev) => {
              const newThreads = new Map(prev);
              const thread = newThreads.get(deletedComment.parentId!) ?? [];
              newThreads.set(
                deletedComment.parentId!,
                thread.filter((c) => c.id !== deletedComment.id)
              );
              return newThreads;
            });
          } else {
            setComments((prev) => prev.filter((c) => c.id !== deletedComment.id));
          }
          setCount((prev) => prev - 1);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [organizationId, entityType, entityId]);

  const addComment = useCallback(
    async (
      content: string,
      author: { id: string; name: string; avatarUrl?: string },
      parentId?: string,
      mentions?: string[]
    ) => {
      if (!organizationId || !entityId) return null;

      const service = getCommentsService();
      const comment = await service.createComment({
        organizationId,
        entityType,
        entityId,
        authorId: author.id,
        authorName: author.name,
        authorAvatarUrl: author.avatarUrl,
        content,
        parentId,
        mentions,
      });

      return comment;
    },
    [organizationId, entityType, entityId]
  );

  const updateComment = useCallback(
    async (commentId: string, content: string, mentions?: string[]) => {
      const service = getCommentsService();
      return service.updateComment(commentId, { content, mentions });
    },
    []
  );

  const deleteComment = useCallback(async (commentId: string) => {
    const service = getCommentsService();
    await service.deleteComment(commentId);
  }, []);

  return {
    comments,
    threads,
    loading,
    error,
    count,
    refetch: fetchComments,
    addComment,
    updateComment,
    deleteComment,
  };
}

/**
 * Hook for logging activity
 */
export function useLogActivity() {
  const logActivity = useCallback(
    async (options: {
      organizationId: string;
      userId: string;
      userName: string;
      userAvatarUrl?: string;
      entityType: EntityType;
      entityId: string;
      entityName: string;
      action: 'created' | 'updated' | 'deleted' | 'status_changed' | 'assigned' | 'commented' | 'mentioned' | 'approved' | 'rejected' | 'completed' | 'started' | 'paused' | 'resumed';
      changes?: Record<string, { old: unknown; new: unknown }>;
      metadata?: Record<string, unknown>;
    }) => {
      const service = getActivityService();
      return service.logActivity(options);
    },
    []
  );

  return { logActivity };
}
