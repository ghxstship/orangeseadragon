/**
 * Activity Service
 * 
 * Logs and retrieves activity for entities. Provides audit trail
 * and activity feed functionality for the Productions module.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { 
  EntityType, 
  ActivityAction, 
  ActivityLogEntry 
} from './types';

export interface CreateActivityOptions {
  organizationId: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  entityType: EntityType;
  entityId: string;
  entityName: string;
  action: ActivityAction;
  changes?: Record<string, { old: unknown; new: unknown }>;
  metadata?: Record<string, unknown>;
}

export interface ActivityFilters {
  entityType?: EntityType;
  entityId?: string;
  userId?: string;
  action?: ActivityAction;
  startDate?: Date;
  endDate?: Date;
}

export class ActivityService {
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
   * Log an activity event
   */
  async logActivity(options: CreateActivityOptions): Promise<ActivityLogEntry> {
    const { data, error } = await this.supabase
      .from('activity_feed')
      .insert({
        organization_id: options.organizationId,
        actor_id: options.userId,
        actor_name: options.userName,
        entity_type: options.entityType,
        entity_id: options.entityId,
        entity_name: options.entityName,
        activity_type: options.action,
        title: `${options.action} ${options.entityType}`,
        metadata: options.metadata as unknown as Database['public']['Tables']['activity_feed']['Insert']['metadata'],
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to log activity: ${error.message}`);
    }

    return this.mapActivityLog(data);
  }

  /**
   * Get activity logs for an organization
   */
  async getActivityLogs(
    organizationId: string,
    filters?: ActivityFilters,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ data: ActivityLogEntry[]; total: number }> {
    let query = this.supabase
      .from('activity_feed')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters?.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }
    if (filters?.entityId) {
      query = query.eq('entity_id', filters.entityId);
    }
    if (filters?.userId) {
      query = query.eq('actor_id', filters.userId);
    }
    if (filters?.action) {
      query = query.eq('activity_type', filters.action);
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString());
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString());
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to get activity logs: ${error.message}`);
    }

    return {
      data: (data ?? []).map(this.mapActivityLog),
      total: count ?? 0,
    };
  }

  /**
   * Get activity logs for a specific entity
   */
  async getEntityActivity(
    organizationId: string,
    entityType: EntityType,
    entityId: string,
    limit: number = 20
  ): Promise<ActivityLogEntry[]> {
    const { data, error } = await this.supabase
      .from('activity_feed')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get entity activity: ${error.message}`);
    }

    return (data ?? []).map(this.mapActivityLog);
  }

  /**
   * Get recent activity for a user
   */
  async getUserActivity(
    organizationId: string,
    userId: string,
    limit: number = 20
  ): Promise<ActivityLogEntry[]> {
    const { data, error } = await this.supabase
      .from('activity_feed')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('actor_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get user activity: ${error.message}`);
    }

    return (data ?? []).map(this.mapActivityLog);
  }

  /**
   * Calculate changes between old and new record
   */
  static calculateChanges(
    oldRecord: Record<string, unknown> | null,
    newRecord: Record<string, unknown> | null,
    trackedFields?: string[]
  ): Record<string, { old: unknown; new: unknown }> {
    const changes: Record<string, { old: unknown; new: unknown }> = {};

    if (!oldRecord && newRecord) {
      // New record - all fields are "new"
      const fields = trackedFields ?? Object.keys(newRecord);
      for (const field of fields) {
        if (field !== 'id' && field !== 'created_at' && field !== 'updated_at') {
          changes[field] = { old: null, new: newRecord[field] };
        }
      }
    } else if (oldRecord && newRecord) {
      // Update - find changed fields
      const fields = trackedFields ?? Object.keys(newRecord);
      for (const field of fields) {
        if (
          field !== 'id' &&
          field !== 'created_at' &&
          field !== 'updated_at' &&
          JSON.stringify(oldRecord[field]) !== JSON.stringify(newRecord[field])
        ) {
          changes[field] = { old: oldRecord[field], new: newRecord[field] };
        }
      }
    }

    return changes;
  }

  /**
   * Map database row to ActivityLogEntry
   */
  private mapActivityLog(data: Record<string, unknown>): ActivityLogEntry {
    return {
      id: data.id as string,
      organizationId: data.organization_id as string,
      userId: data.actor_id as string,
      userName: data.actor_name as string,
      userAvatarUrl: undefined,
      entityType: data.entity_type as EntityType,
      entityId: data.entity_id as string,
      entityName: data.entity_name as string,
      action: data.activity_type as ActivityAction,
      changes: undefined,
      metadata: data.metadata as Record<string, unknown> | undefined,
      createdAt: data.created_at as string,
    };
  }
}

// Singleton instance
let activityServiceInstance: ActivityService | null = null;

export function getActivityService(): ActivityService {
  if (!activityServiceInstance) {
    activityServiceInstance = new ActivityService();
  }
  return activityServiceInstance;
}
