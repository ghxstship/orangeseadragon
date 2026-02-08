/**
 * Real-Time Collaboration Types
 */

export type EntityType = 
  | 'event'
  | 'runsheet'
  | 'work_order'
  | 'inspection'
  | 'punch_item'
  | 'permit'
  | 'catering_order'
  | 'guest_list'
  | 'rider'
  | 'stage'
  | 'hospitality_request'
  | 'tech_spec'
  | 'production_advance'
  | 'advance_item'
  | 'crew_member'
  | 'crew_assignment';

export type ActivityAction = 
  | 'created'
  | 'updated'
  | 'deleted'
  | 'status_changed'
  | 'assigned'
  | 'commented'
  | 'mentioned'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'started'
  | 'paused'
  | 'resumed';

export interface RealtimeEvent<T = unknown> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  new: T | null;
  old: T | null;
  commitTimestamp: string;
}

export interface PresenceState {
  oderId: string;
  userId: string;
  userName: string;
  avatarUrl?: string;
  entityType: EntityType;
  entityId: string;
  action: 'viewing' | 'editing';
  cursor?: { x: number; y: number };
  lastSeen: string;
}

export interface ActivityLogEntry {
  id: string;
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
  createdAt: string;
}

export interface Comment {
  id: string;
  organizationId: string;
  entityType: EntityType;
  entityId: string;
  parentId?: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  content: string;
  mentions: string[];
  attachments?: CommentAttachment[];
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface RealtimeSubscription {
  unsubscribe: () => void;
}

export interface SubscriptionOptions {
  organizationId: string;
  entityType?: EntityType;
  entityId?: string;
}

export interface PresenceOptions {
  organizationId: string;
  entityType: EntityType;
  entityId: string;
  userId: string;
  userName: string;
  avatarUrl?: string;
}
