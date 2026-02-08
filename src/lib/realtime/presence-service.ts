/**
 * Presence Service
 * 
 * Tracks user presence and activity on specific entities using Supabase Realtime.
 * Shows who is viewing/editing records in real-time.
 */

import { createClient, RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { EntityType, PresenceState, PresenceOptions } from './types';

export class PresenceService {
  private supabase: SupabaseClient<Database>;
  private channels: Map<string, RealtimeChannel> = new Map();
  private presenceState: Map<string, Map<string, PresenceState>> = new Map();
  private listeners: Map<string, Set<(state: PresenceState[]) => void>> = new Map();
  private heartbeatIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
  }

  /**
   * Join a presence channel for a specific entity
   */
  join(
    options: PresenceOptions,
    onPresenceChange: (users: PresenceState[]) => void
  ): () => void {
    const { organizationId, entityType, entityId, userId, userName, avatarUrl } = options;
    const channelKey = `presence:${organizationId}:${entityType}:${entityId}`;

    // Initialize state tracking
    if (!this.presenceState.has(channelKey)) {
      this.presenceState.set(channelKey, new Map());
    }
    if (!this.listeners.has(channelKey)) {
      this.listeners.set(channelKey, new Set());
    }

    this.listeners.get(channelKey)!.add(onPresenceChange);

    // Create or join channel
    if (!this.channels.has(channelKey)) {
      const channel = this.supabase.channel(channelKey, {
        config: {
          presence: {
            key: userId,
          },
        },
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState<PresenceState>();
          const users: PresenceState[] = [];

          Object.values(state).forEach((presences) => {
            presences.forEach((presence) => {
              users.push(presence);
            });
          });

          // Update local state
          const stateMap = this.presenceState.get(channelKey)!;
          stateMap.clear();
          users.forEach((user) => {
            stateMap.set(user.oderId, user);
          });

          // Notify listeners
          this.notifyListeners(channelKey);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log(`[Presence] User ${key} joined ${channelKey}`, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log(`[Presence] User ${key} left ${channelKey}`, leftPresences);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // Track own presence
            await channel.track({
              oderId: `${userId}-${Date.now()}`,
              userId,
              userName,
              avatarUrl,
              entityType,
              entityId,
              action: 'viewing',
              lastSeen: new Date().toISOString(),
            } as PresenceState);

            console.log(`[Presence] Joined ${channelKey}`);
          }
        });

      this.channels.set(channelKey, channel);

      // Set up heartbeat to keep presence alive
      const heartbeat = setInterval(async () => {
        const ch = this.channels.get(channelKey);
        if (ch) {
          await ch.track({
            oderId: `${userId}-${Date.now()}`,
            userId,
            userName,
            avatarUrl,
            entityType,
            entityId,
            action: 'viewing',
            lastSeen: new Date().toISOString(),
          } as PresenceState);
        }
      }, 30000); // Every 30 seconds

      this.heartbeatIntervals.set(channelKey, heartbeat);
    }

    // Return cleanup function
    return () => {
      this.leave(channelKey, userId, onPresenceChange);
    };
  }

  /**
   * Update presence state (e.g., switch from viewing to editing)
   */
  async updatePresence(
    options: PresenceOptions,
    action: 'viewing' | 'editing',
    cursor?: { x: number; y: number }
  ): Promise<void> {
    const { organizationId, entityType, entityId, userId, userName, avatarUrl } = options;
    const channelKey = `presence:${organizationId}:${entityType}:${entityId}`;

    const channel = this.channels.get(channelKey);
    if (channel) {
      await channel.track({
        oderId: `${userId}-${Date.now()}`,
        userId,
        userName,
        avatarUrl,
        entityType,
        entityId,
        action,
        cursor,
        lastSeen: new Date().toISOString(),
      } as PresenceState);
    }
  }

  /**
   * Leave a presence channel
   */
  private leave(
    channelKey: string,
    userId: string,
    callback: (users: PresenceState[]) => void
  ): void {
    // Remove listener
    const listeners = this.listeners.get(channelKey);
    if (listeners) {
      listeners.delete(callback);

      // If no more listeners, clean up channel
      if (listeners.size === 0) {
        const channel = this.channels.get(channelKey);
        if (channel) {
          channel.untrack();
          channel.unsubscribe();
          this.channels.delete(channelKey);
        }

        // Clear heartbeat
        const heartbeat = this.heartbeatIntervals.get(channelKey);
        if (heartbeat) {
          clearInterval(heartbeat);
          this.heartbeatIntervals.delete(channelKey);
        }

        this.presenceState.delete(channelKey);
        this.listeners.delete(channelKey);
      }
    }
  }

  /**
   * Get current presence state for an entity
   */
  getPresence(
    organizationId: string,
    entityType: EntityType,
    entityId: string
  ): PresenceState[] {
    const channelKey = `presence:${organizationId}:${entityType}:${entityId}`;
    const state = this.presenceState.get(channelKey);
    return state ? Array.from(state.values()) : [];
  }

  /**
   * Notify all listeners of presence changes
   */
  private notifyListeners(channelKey: string): void {
    const listeners = this.listeners.get(channelKey);
    const state = this.presenceState.get(channelKey);

    if (listeners && state) {
      const users = Array.from(state.values());
      listeners.forEach((callback) => callback(users));
    }
  }

  /**
   * Disconnect all presence channels
   */
  disconnect(): void {
    this.heartbeatIntervals.forEach((interval) => clearInterval(interval));
    this.heartbeatIntervals.clear();

    this.channels.forEach((channel) => {
      channel.untrack();
      channel.unsubscribe();
    });
    this.channels.clear();
    this.presenceState.clear();
    this.listeners.clear();
  }
}

// Singleton instance
let presenceServiceInstance: PresenceService | null = null;

export function getPresenceService(): PresenceService {
  if (!presenceServiceInstance) {
    presenceServiceInstance = new PresenceService();
  }
  return presenceServiceInstance;
}
