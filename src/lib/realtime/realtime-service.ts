/**
 * Real-Time Service
 * 
 * Provides WebSocket-based subscriptions for entity changes using Supabase Realtime.
 * Supports table-level and row-level subscriptions with automatic reconnection.
 */

import { createClient, RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { captureError } from '@/lib/observability';
import type { Database } from '@/types/database';
import type { 
  EntityType, 
  RealtimeEvent, 
  RealtimeSubscription, 
  SubscriptionOptions 
} from './types';

type TableName = keyof Database['public']['Tables'];

const ENTITY_TABLE_MAP: Record<EntityType, TableName> = {
  event: 'events',
  runsheet: 'runsheets',
  work_order: 'work_orders',
  inspection: 'inspections',
  punch_item: 'punch_items',
  permit: 'permits',
  catering_order: 'catering_orders',
  guest_list: 'guest_lists',
  rider: 'riders',
  stage: 'stages',
  hospitality_request: 'hospitality_requests',
  tech_spec: 'tech_specs',
  advance_item: 'advance_reports',
  production_advance: 'site_advances',
  crew_member: 'crew_calls',
  crew_assignment: 'crew_assignments',
};

export class RealtimeService {
  private supabase: SupabaseClient<Database>;
  private channels: Map<string, RealtimeChannel> = new Map();
  private listeners: Map<string, Set<(event: RealtimeEvent) => void>> = new Map();

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    this.supabase = createClient<Database>(supabaseUrl, supabaseKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }

  /**
   * Subscribe to changes on a specific entity type within an organization
   */
  subscribeToEntity<T = unknown>(
    options: SubscriptionOptions,
    callback: (event: RealtimeEvent<T>) => void
  ): RealtimeSubscription {
    const { organizationId, entityType, entityId } = options;

    if (!entityType) {
      throw new Error('entityType is required for entity subscriptions');
    }

    const tableName = ENTITY_TABLE_MAP[entityType];
    if (!tableName) {
      throw new Error(`Unknown entity type: ${entityType}`);
    }

    const channelKey = entityId 
      ? `${organizationId}:${tableName}:${entityId}`
      : `${organizationId}:${tableName}`;

    // Add listener to existing channel or create new one
    if (!this.listeners.has(channelKey)) {
      this.listeners.set(channelKey, new Set());
    }
    this.listeners.get(channelKey)!.add(callback as (event: RealtimeEvent) => void);

    // Create channel if it doesn't exist
    if (!this.channels.has(channelKey)) {
      const filter = entityId
        ? `organization_id=eq.${organizationId},id=eq.${entityId}`
        : `organization_id=eq.${organizationId}`;

      const channel = this.supabase
        .channel(channelKey)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: tableName,
            filter,
          },
          (payload) => {
            const event: RealtimeEvent = {
              eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
              table: tableName,
              schema: 'public',
              new: payload.new,
              old: payload.old,
              commitTimestamp: payload.commit_timestamp,
            };

            // Notify all listeners for this channel
            const listeners = this.listeners.get(channelKey);
            if (listeners) {
              listeners.forEach((listener) => listener(event));
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`[Realtime] Subscribed to ${channelKey}`);
          } else if (status === 'CHANNEL_ERROR') {
            captureError(new Error(`Error subscribing to ${channelKey}`), 'realtime.subscribe.error');
          }
        });

      this.channels.set(channelKey, channel);
    }

    return {
      unsubscribe: () => {
        const listeners = this.listeners.get(channelKey);
        if (listeners) {
          listeners.delete(callback as (event: RealtimeEvent) => void);

          // If no more listeners, unsubscribe from channel
          if (listeners.size === 0) {
            const channel = this.channels.get(channelKey);
            if (channel) {
              channel.unsubscribe();
              this.channels.delete(channelKey);
            }
            this.listeners.delete(channelKey);
          }
        }
      },
    };
  }

  /**
   * Subscribe to all production-related changes for an organization
   */
  subscribeToProductions(
    organizationId: string,
    callback: (event: RealtimeEvent & { entityType: EntityType }) => void
  ): RealtimeSubscription {
    const subscriptions: RealtimeSubscription[] = [];

    const productionEntities: EntityType[] = [
      'event',
      'runsheet',
      'work_order',
      'inspection',
      'punch_item',
      'permit',
      'catering_order',
      'guest_list',
      'rider',
      'stage',
      'hospitality_request',
      'tech_spec',
    ];

    for (const entityType of productionEntities) {
      const sub = this.subscribeToEntity(
        { organizationId, entityType },
        (event) => {
          callback({ ...event, entityType });
        }
      );
      subscriptions.push(sub);
    }

    return {
      unsubscribe: () => {
        subscriptions.forEach((sub) => sub.unsubscribe());
      },
    };
  }

  /**
   * Subscribe to activity log changes
   */
  subscribeToActivityLog(
    organizationId: string,
    callback: (event: RealtimeEvent) => void
  ): RealtimeSubscription {
    const channelKey = `${organizationId}:activity_logs`;

    if (!this.listeners.has(channelKey)) {
      this.listeners.set(channelKey, new Set());
    }
    this.listeners.get(channelKey)!.add(callback);

    if (!this.channels.has(channelKey)) {
      const channel = this.supabase
        .channel(channelKey)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'entity_activity_logs',
            filter: `organization_id=eq.${organizationId}`,
          },
          (payload) => {
            const event: RealtimeEvent = {
              eventType: 'INSERT',
              table: 'entity_activity_logs',
              schema: 'public',
              new: payload.new,
              old: null,
              commitTimestamp: payload.commit_timestamp,
            };

            const listeners = this.listeners.get(channelKey);
            if (listeners) {
              listeners.forEach((listener) => listener(event));
            }
          }
        )
        .subscribe();

      this.channels.set(channelKey, channel);
    }

    return {
      unsubscribe: () => {
        const listeners = this.listeners.get(channelKey);
        if (listeners) {
          listeners.delete(callback);
          if (listeners.size === 0) {
            const channel = this.channels.get(channelKey);
            if (channel) {
              channel.unsubscribe();
              this.channels.delete(channelKey);
            }
            this.listeners.delete(channelKey);
          }
        }
      },
    };
  }

  /**
   * Subscribe to comments on a specific entity
   */
  subscribeToComments(
    organizationId: string,
    entityType: EntityType,
    entityId: string,
    callback: (event: RealtimeEvent) => void
  ): RealtimeSubscription {
    const channelKey = `${organizationId}:comments:${entityType}:${entityId}`;

    if (!this.listeners.has(channelKey)) {
      this.listeners.set(channelKey, new Set());
    }
    this.listeners.get(channelKey)!.add(callback);

    if (!this.channels.has(channelKey)) {
      const channel = this.supabase
        .channel(channelKey)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'entity_comments',
            filter: `organization_id=eq.${organizationId},entity_type=eq.${entityType},entity_id=eq.${entityId}`,
          },
          (payload) => {
            const event: RealtimeEvent = {
              eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
              table: 'entity_comments',
              schema: 'public',
              new: payload.new,
              old: payload.old,
              commitTimestamp: payload.commit_timestamp,
            };

            const listeners = this.listeners.get(channelKey);
            if (listeners) {
              listeners.forEach((listener) => listener(event));
            }
          }
        )
        .subscribe();

      this.channels.set(channelKey, channel);
    }

    return {
      unsubscribe: () => {
        const listeners = this.listeners.get(channelKey);
        if (listeners) {
          listeners.delete(callback);
          if (listeners.size === 0) {
            const channel = this.channels.get(channelKey);
            if (channel) {
              channel.unsubscribe();
              this.channels.delete(channelKey);
            }
            this.listeners.delete(channelKey);
          }
        }
      },
    };
  }

  /**
   * Disconnect all channels
   */
  disconnect(): void {
    this.channels.forEach((channel) => {
      channel.unsubscribe();
    });
    this.channels.clear();
    this.listeners.clear();
  }

  /**
   * Get the Supabase client for direct access
   */
  getClient(): SupabaseClient<Database> {
    return this.supabase;
  }
}

// Singleton instance
let realtimeServiceInstance: RealtimeService | null = null;

export function getRealtimeService(): RealtimeService {
  if (!realtimeServiceInstance) {
    realtimeServiceInstance = new RealtimeService();
  }
  return realtimeServiceInstance;
}
