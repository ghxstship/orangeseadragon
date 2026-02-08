// /app/api/activity/feed/route.ts

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';

/**
 * ACTIVITY FEED API (SSOT)
 * 
 * Queries activity_feed table directly. All source entities (activities,
 * comments, approvals, etc.) sync to this table via database triggers.
 * RLS policies enforce RBAC at the database level.
 * 
 * Query Parameters:
 * - limit: number of items to return (default 50, max 100)
 * - offset: pagination offset
 * - activityType: filter by activity type (comment, call, email, etc.)
 * - entityType: filter by entity type (task, deal, contact, etc.)
 * - entityId: filter by specific entity
 * - actorId: filter by user who performed action
 * - projectId: filter by project
 * - eventId: filter by event
 * - startDate: filter activities after this date
 * - endDate: filter activities before this date
 */

export type ActivityType = 
  | 'comment'
  | 'note'
  | 'call'
  | 'email'
  | 'meeting'
  | 'task'
  | 'demo'
  | 'proposal'
  | 'approval'
  | 'status_change';

export type ActivityCategory = 
  | 'crm'
  | 'task'
  | 'document'
  | 'workflow'
  | 'support'
  | 'system';

const CATEGORY_CONFIG: Record<ActivityCategory, { label: string; color: string }> = {
  crm: { label: 'CRM', color: '#3b82f6' },
  task: { label: 'Tasks', color: '#f59e0b' },
  document: { label: 'Documents', color: '#8b5cf6' },
  workflow: { label: 'Workflows', color: '#10b981' },
  support: { label: 'Support', color: '#ec4899' },
  system: { label: 'System', color: '#6b7280' },
};

const TYPE_CONFIG: Record<ActivityType, { label: string; icon: string }> = {
  comment: { label: 'Comment', icon: 'message-circle' },
  note: { label: 'Note', icon: 'sticky-note' },
  call: { label: 'Call', icon: 'phone' },
  email: { label: 'Email', icon: 'mail' },
  meeting: { label: 'Meeting', icon: 'users' },
  task: { label: 'Task', icon: 'check-square' },
  demo: { label: 'Demo', icon: 'presentation' },
  proposal: { label: 'Proposal', icon: 'file-text' },
  approval: { label: 'Approval', icon: 'check-circle' },
  status_change: { label: 'Status Change', icon: 'refresh-cw' },
};

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;

  const searchParams = request.nextUrl.searchParams;
  
  // Parse pagination
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
  const offset = parseInt(searchParams.get('offset') || '0');
  
  // Parse filters
  const activityType = searchParams.get('activityType');
  const activityCategory = searchParams.get('activityCategory');
  const entityType = searchParams.get('entityType');
  const entityId = searchParams.get('entityId');
  const actorId = searchParams.get('actorId');
  const projectId = searchParams.get('projectId');
  const eventId = searchParams.get('eventId');
  const companyId = searchParams.get('companyId');
  const dealId = searchParams.get('dealId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  try {
    type ActivityFeedRow = {
      id: string;
      organization_id: string;
      activity_type: string;
      activity_category: string | null;
      entity_type: string | null;
      entity_id: string | null;
      entity_name: string | null;
      actor_id: string | null;
      actor_name: string | null;
      title: string;
      content: string | null;
      metadata: Record<string, unknown> | null;
      project_id: string | null;
      event_id: string | null;
      company_id: string | null;
      contact_id: string | null;
      deal_id: string | null;
      visibility: string | null;
      activity_at: string;
      created_at: string | null;
    };

    // Build query - RLS policies handle organization filtering and RBAC
    let query = supabase
      .from('activity_feed')
      .select('*', { count: 'exact' })
      .order('activity_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (activityType) {
      query = query.eq('activity_type', activityType);
    }
    if (activityCategory) {
      query = query.eq('activity_category', activityCategory);
    }
    if (entityType) {
      query = query.eq('entity_type', entityType);
    }
    if (entityId) {
      query = query.eq('entity_id', entityId);
    }
    if (actorId) {
      query = query.eq('actor_id', actorId);
    }
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    if (eventId) {
      query = query.eq('event_id', eventId);
    }
    if (companyId) {
      query = query.eq('company_id', companyId);
    }
    if (dealId) {
      query = query.eq('deal_id', dealId);
    }
    if (startDate) {
      query = query.gte('activity_at', startDate);
    }
    if (endDate) {
      query = query.lte('activity_at', endDate + 'T23:59:59');
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[Activity Feed API] Query error:', error);
      return supabaseError(error);
    }

    // Transform to unified format
    const items = ((data || []) as ActivityFeedRow[]).map((item) => {
      const category = (item.activity_category || 'system') as ActivityCategory;
      const type = item.activity_type as ActivityType;
      
      return {
        id: item.id,
        activityType: type,
        activityCategory: category,
        entityType: item.entity_type,
        entityId: item.entity_id,
        entityName: item.entity_name,
        entityPath: item.entity_type && item.entity_id 
          ? getEntityPath(item.entity_type, item.entity_id)
          : null,
        actorId: item.actor_id,
        actorName: item.actor_name,
        title: item.title,
        content: item.content,
        metadata: item.metadata,
        projectId: item.project_id,
        eventId: item.event_id,
        companyId: item.company_id,
        dealId: item.deal_id,
        visibility: item.visibility,
        activityAt: item.activity_at,
        createdAt: item.created_at,
        // UI helpers
        categoryLabel: CATEGORY_CONFIG[category]?.label || category,
        categoryColor: CATEGORY_CONFIG[category]?.color || '#6b7280',
        typeLabel: TYPE_CONFIG[type]?.label || type,
        typeIcon: TYPE_CONFIG[type]?.icon || 'activity',
      };
    });

    return apiSuccess({
      items,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('[Activity Feed API] Error:', error);
    return serverError('Failed to fetch activity feed');
  }
}

function getEntityPath(entityType: string, entityId: string): string {
  const pathMap: Record<string, string> = {
    task: '/core/tasks',
    deal: '/business/deals',
    contact: '/business/contacts',
    company: '/business/companies',
    document: '/core/documents',
    ticket: '/operations/support',
    event: '/productions/events',
    project: '/core/projects',
    approval_request: '/core/approvals',
  };
  
  const basePath = pathMap[entityType] || '/core';
  return `${basePath}/${entityId}`;
}
