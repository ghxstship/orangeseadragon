/**
 * Server-side Notification Dispatch
 *
 * Centralizes all notification sends from API routes.
 * Persists to the `notifications` table and can fan out
 * to multi-channel delivery via NotificationService.
 *
 * Usage in API routes:
 *   import { dispatchNotification } from '@/lib/notifications/dispatch';
 *   await dispatchNotification(supabase, { ... });
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { captureError } from '@/lib/observability';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface NotificationPayload {
  organization_id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  entity_type?: string;
  entity_id?: string;
  channel?: 'in_app' | 'email' | 'push' | 'sms';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface BulkNotificationPayload extends Omit<NotificationPayload, 'user_id'> {
  user_ids: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Single dispatch
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dispatch a single notification (persisted to Supabase).
 * Swallows errors so callers can fire-and-forget.
 */
export async function dispatchNotification(
  supabase: SupabaseClient,
  payload: NotificationPayload
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        organization_id: payload.organization_id,
        user_id: payload.user_id,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        data: payload.data ?? null,
        entity_type: payload.entity_type ?? null,
        entity_id: payload.entity_id ?? null,
      })
      .select('id')
      .single();

    if (error) {
      captureError(error, 'notification.dispatch_failed', {
        type: payload.type,
        user_id: payload.user_id,
      });
      return null;
    }

    return data?.id ?? null;
  } catch (e) {
    captureError(e, 'notification.dispatch_unhandled', {
      type: payload.type,
      user_id: payload.user_id,
    });
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Bulk dispatch
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dispatch the same notification to multiple users.
 * Inserts all rows in a single batch for efficiency.
 */
export async function dispatchBulkNotification(
  supabase: SupabaseClient,
  payload: BulkNotificationPayload
): Promise<number> {
  if (!payload.user_ids.length) return 0;

  try {
    const rows = payload.user_ids.map((uid) => ({
      organization_id: payload.organization_id,
      user_id: uid,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      data: payload.data ?? null,
      entity_type: payload.entity_type ?? null,
      entity_id: payload.entity_id ?? null,
    }));

    const { error } = await supabase.from('notifications').insert(rows);

    if (error) {
      captureError(error, 'notification.bulk_dispatch_failed', {
        type: payload.type,
        count: payload.user_ids.length,
      });
      return 0;
    }

    return payload.user_ids.length;
  } catch (e) {
    captureError(e, 'notification.bulk_dispatch_unhandled', {
      type: payload.type,
      count: payload.user_ids.length,
    });
    return 0;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Role-based dispatch helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dispatch a notification to all users in an org who hold specific roles.
 * Useful for approval/escalation notifications.
 */
export async function dispatchToRoles(
  supabase: SupabaseClient,
  payload: Omit<NotificationPayload, 'user_id'> & { roles: string[] }
): Promise<number> {
  try {
    const { data: members, error: memberErr } = await supabase
      .from('organization_members')
      .select('user_id, roles!inner(name)')
      .eq('organization_id', payload.organization_id)
      .eq('status', 'active')
      .in('roles.name', payload.roles);

    if (memberErr || !members?.length) {
      if (memberErr) {
        captureError(memberErr, 'notification.role_lookup_failed', {
          roles: payload.roles,
        });
      }
      return 0;
    }

    const userIds = members.map(
      (m: { user_id: string }) => m.user_id
    );

    return dispatchBulkNotification(supabase, {
      ...payload,
      user_ids: Array.from(new Set(userIds)),
    });
  } catch (e) {
    captureError(e, 'notification.role_dispatch_unhandled', {
      roles: payload.roles,
    });
    return 0;
  }
}
