'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getPresenceService } from '@/lib/realtime/presence-service';
import type { EntityType, PresenceState } from '@/lib/realtime/types';

interface UseCollaborationOptions {
  organizationId: string;
  entityType: EntityType;
  entityId: string;
  userId: string;
  userName: string;
  avatarUrl?: string;
  enabled?: boolean;
}

interface CollaborationState {
  users: PresenceState[];
  isConnected: boolean;
  viewingCount: number;
  editingCount: number;
}

export function useCollaboration(options: UseCollaborationOptions) {
  const {
    organizationId,
    entityType,
    entityId,
    userId,
    userName,
    avatarUrl,
    enabled = true,
  } = options;

  const [state, setState] = useState<CollaborationState>({
    users: [],
    isConnected: false,
    viewingCount: 0,
    editingCount: 0,
  });

  const cleanupRef = useRef<(() => void) | null>(null);
  const presenceService = useRef(getPresenceService());

  const handlePresenceChange = useCallback((users: PresenceState[]) => {
    // Filter out current user and deduplicate by userId
    const otherUsers = users.filter(u => u.userId !== userId);
    const uniqueUsers = Array.from(
      new Map(otherUsers.map(u => [u.userId, u])).values()
    );

    setState({
      users: uniqueUsers,
      isConnected: true,
      viewingCount: uniqueUsers.filter(u => u.action === 'viewing').length,
      editingCount: uniqueUsers.filter(u => u.action === 'editing').length,
    });
  }, [userId]);

  useEffect(() => {
    if (!enabled || !organizationId || !entityId || !userId) {
      return;
    }

    // Join presence channel
    cleanupRef.current = presenceService.current.join(
      {
        organizationId,
        entityType,
        entityId,
        userId,
        userName,
        avatarUrl,
      },
      handlePresenceChange
    );

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      setState({
        users: [],
        isConnected: false,
        viewingCount: 0,
        editingCount: 0,
      });
    };
  }, [organizationId, entityType, entityId, userId, userName, avatarUrl, enabled, handlePresenceChange]);

  const setEditing = useCallback(async (isEditing: boolean) => {
    if (!enabled) return;

    await presenceService.current.updatePresence(
      {
        organizationId,
        entityType,
        entityId,
        userId,
        userName,
        avatarUrl,
      },
      isEditing ? 'editing' : 'viewing'
    );
  }, [organizationId, entityType, entityId, userId, userName, avatarUrl, enabled]);

  const updateCursor = useCallback(async (x: number, y: number) => {
    if (!enabled) return;

    await presenceService.current.updatePresence(
      {
        organizationId,
        entityType,
        entityId,
        userId,
        userName,
        avatarUrl,
      },
      'editing',
      { x, y }
    );
  }, [organizationId, entityType, entityId, userId, userName, avatarUrl, enabled]);

  return {
    ...state,
    setEditing,
    updateCursor,
    otherUsers: state.users,
    hasOtherUsers: state.users.length > 0,
    isBeingEdited: state.editingCount > 0,
  };
}
