'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Check,
  CheckCircle2,
  Clock,
  MessageSquare,
  AtSign,
  AlertTriangle,
  UserPlus,
  FileText,
  Zap,
  Inbox,
  RefreshCw,
  Settings,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import { StatCard, StatGrid } from '@/components/common/stat-card';
import { PageShell } from '@/components/common/page-shell';
import { ContextualEmptyState } from '@/components/common/contextual-empty-state';
import { InboxItemRow } from '@/components/common/inbox-item-row';
import { InboxItemDetail } from '@/components/common/inbox-item-detail';
import { cn } from '@/lib/utils';
import { getErrorMessage, throwApiErrorResponse } from '@/lib/api/error-message';

type InboxItemType = 'approval' | 'mention' | 'alert' | 'assignment' | 'comment' | 'update';
type InboxItemStatus = 'unread' | 'read' | 'actioned' | 'dismissed';
type SourceEntity = 'task' | 'document' | 'workflow_run' | 'calendar_event' | 'comment' | 'production';

interface InboxItem {
  id: string;
  type: InboxItemType;
  title: string;
  body?: string;
  source_entity: SourceEntity;
  source_id: string;
  status: InboxItemStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  due_at?: string;
  created_at: string;
  from_user?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

interface TimeGroup {
  key: string;
  label: string;
  items: InboxItem[];
}

const TYPE_ICONS: Record<InboxItemType, React.ElementType> = {
  approval: CheckCircle2,
  mention: AtSign,
  alert: AlertTriangle,
  assignment: UserPlus,
  comment: MessageSquare,
  update: Bell,
};

const SOURCE_ICONS: Record<SourceEntity, React.ElementType> = {
  task: Check,
  document: FileText,
  workflow_run: Zap,
  calendar_event: Clock,
  comment: MessageSquare,
  production: Bell,
};

const SOURCE_PATHS: Record<SourceEntity, (id: string) => string> = {
  task: (id) => `/core/tasks/${id}`,
  document: (id) => `/core/documents/${id}`,
  workflow_run: (id) => `/core/workflows/${id}`,
  calendar_event: (id) => `/core/calendar/${id}`,
  comment: (id) => `/core/tasks/${id}`,
  production: (id) => `/productions/${id}`,
};

function getTimeGroupKey(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const itemDate = new Date(date);
  itemDate.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays <= 7) return 'this_week';
  if (diffDays <= 14) return 'last_week';
  return 'older';
}

const TIME_GROUP_LABELS: Record<string, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  this_week: 'Earlier This Week',
  last_week: 'Last Week',
  older: 'Older',
};

const TIME_GROUP_ORDER = ['today', 'yesterday', 'this_week', 'last_week', 'older'];

export default function InboxPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState('all');
  const [items, setItems] = React.useState<InboxItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [detailItem, setDetailItem] = React.useState<InboxItem | null>(null);

  const fetchInboxItems = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeTab === 'unread') params.set('status', 'unread');
      if (activeTab === 'approvals') params.set('type', 'approval');
      if (activeTab === 'mentions') params.set('type', 'mention');
      if (activeTab === 'alerts') params.set('type', 'alert');

      const response = await fetch(`/api/inbox?${params}`);
      if (!response.ok) {
        await throwApiErrorResponse(response, 'Failed to load notifications');
      }
      const data = await response.json();
      setItems(data.data || []);
    } catch (err) {
      console.error('Failed to fetch inbox items:', err);
      setError(getErrorMessage(err, 'Failed to load notifications'));
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  React.useEffect(() => {
    fetchInboxItems();
  }, [fetchInboxItems]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        if (selectedIds.size > 0) {
          handleMarkRead(Array.from(selectedIds));
        } else {
          handleMarkAllRead();
        }
      }
      if (e.key === 'Backspace' && (e.metaKey || e.ctrlKey) && selectedIds.size > 0) {
        e.preventDefault();
        handleDismiss(Array.from(selectedIds));
      }
      if (e.key === 'Escape') {
        setSelectedIds(new Set());
        setDetailItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds]);

  const handleMarkRead = async (ids: string[]) => {
    try {
      const response = await fetch('/api/inbox/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (!response.ok) {
        await throwApiErrorResponse(response, 'Failed to mark notifications as read');
      }
      setItems((prev) =>
        prev.map((item) =>
          ids.includes(item.id) ? { ...item, status: 'read' as InboxItemStatus } : item
        )
      );
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllRead = () => {
    const unreadIds = items.filter((i) => i.status === 'unread').map((i) => i.id);
    if (unreadIds.length > 0) {
      handleMarkRead(unreadIds);
    }
  };

  const handleApprove = async (item: InboxItem) => {
    try {
      const response = await fetch(`/api/inbox/${item.id}/approve`, { method: 'POST' });
      if (!response.ok) {
        await throwApiErrorResponse(response, 'Failed to approve notification');
      }
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'actioned' as InboxItemStatus } : i))
      );
      setDetailItem(null);
    } catch (err) {
      console.error('Failed to approve:', err);
    }
  };

  const handleReject = async (item: InboxItem) => {
    try {
      const response = await fetch(`/api/inbox/${item.id}/reject`, { method: 'POST' });
      if (!response.ok) {
        await throwApiErrorResponse(response, 'Failed to reject notification');
      }
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'actioned' as InboxItemStatus } : i))
      );
      setDetailItem(null);
    } catch (err) {
      console.error('Failed to reject:', err);
    }
  };

  const handleDismiss = async (ids: string[]) => {
    try {
      const response = await fetch('/api/inbox/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (!response.ok) {
        await throwApiErrorResponse(response, 'Failed to dismiss notifications');
      }
      setItems((prev) => prev.filter((item) => !ids.includes(item.id)));
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Failed to dismiss:', err);
    }
  };

  const handleNavigateToSource = (item: InboxItem) => {
    const pathFn = SOURCE_PATHS[item.source_entity];
    if (pathFn) {
      router.push(pathFn(item.source_id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  };

  const unreadCount = items.filter((i) => i.status === 'unread').length;
  const approvalCount = items.filter((i) => i.type === 'approval' && i.status !== 'actioned').length;
  const urgentCount = items.filter((i) => i.priority === 'urgent' && i.status === 'unread').length;

  const tabCounts: Record<string, number> = {
    all: items.length,
    unread: unreadCount,
    approvals: approvalCount,
    mentions: items.filter((i) => i.type === 'mention').length,
    alerts: items.filter((i) => i.type === 'alert').length,
  };

  // Group items by time
  const timeGroups = React.useMemo<TimeGroup[]>(() => {
    const groups: Record<string, InboxItem[]> = {};
    TIME_GROUP_ORDER.forEach((key) => (groups[key] = []));

    items.forEach((item) => {
      const groupKey = getTimeGroupKey(item.created_at);
      groups[groupKey].push(item);
    });

    return TIME_GROUP_ORDER
      .filter((key) => groups[key].length > 0)
      .map((key) => ({
        key,
        label: TIME_GROUP_LABELS[key],
        items: groups[key],
      }));
  }, [items]);

  const headerActions = selectedIds.size > 0 ? (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleMarkRead(Array.from(selectedIds))}
      >
        <Check className="mr-2 h-4 w-4" />
        Mark Read ({selectedIds.size})
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleDismiss(Array.from(selectedIds))}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Dismiss ({selectedIds.size})
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setSelectedIds(new Set())}
      >
        Clear
      </Button>
    </>
  ) : (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={fetchInboxItems}
        disabled={loading}
      >
        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleMarkAllRead}
        disabled={unreadCount === 0}
      >
        <Check className="mr-2 h-4 w-4" />
        Mark all read
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => router.push('/account/notifications')}
      >
        <Settings className="h-4 w-4" />
      </Button>
    </>
  );

  if (error && !loading) {
    return (
      <PageShell
        title="Inbox"
        description="Notifications, approvals & action items"
      >
        <div className="flex h-full items-center justify-center p-8">
          <ContextualEmptyState
            type="error"
            title="Failed to load notifications"
            description={error}
            actionLabel="Try again"
            onAction={fetchInboxItems}
          />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Inbox"
      description="Notifications, approvals & action items"
      actions={headerActions}
      contentClassName="space-y-6"
    >
        {/* KPI Stats */}
        <StatGrid columns={4}>
          <StatCard
            title="Unread"
            value={loading ? '...' : String(unreadCount)}
            icon={Bell}
            trend={unreadCount > 10 ? { value: unreadCount, isPositive: false } : undefined}
          />
          <StatCard
            title="Pending Approvals"
            value={loading ? '...' : String(approvalCount)}
            icon={CheckCircle2}
            trend={approvalCount > 0 ? { value: approvalCount, isPositive: false } : undefined}
            description={approvalCount > 0 ? 'action required' : 'all clear'}
          />
          <StatCard
            title="Urgent"
            value={loading ? '...' : String(urgentCount)}
            icon={AlertTriangle}
            trend={urgentCount > 0 ? { value: urgentCount, isPositive: false } : undefined}
          />
          <StatCard
            title="Total"
            value={loading ? '...' : String(items.length)}
            icon={Inbox}
          />
        </StatGrid>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList variant="underline">
            <TabsTrigger value="all" className="gap-2">
              All
              {tabCounts.all > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tabCounts.all}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread" className="gap-2">
              Unread
              {tabCounts.unread > 0 && (
                <Badge variant="default" className="text-xs">
                  {tabCounts.unread}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approvals" className="gap-2">
              Approvals
              {tabCounts.approvals > 0 && (
                <Badge variant="warning" className="text-xs">
                  {tabCounts.approvals}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="mentions" className="gap-2">
              Mentions
              {tabCounts.mentions > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tabCounts.mentions}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              Alerts
              {tabCounts.alerts > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tabCounts.alerts}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Loading State */}
        {loading && (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <ContextualEmptyState
            type="no-data"
            title="You're all caught up!"
            description="New notifications will appear here when you receive mentions, approvals, or alerts."
          />
        )}

        {/* Time-Grouped Item List */}
        {!loading && items.length > 0 && (
          <div className="space-y-6">
            {/* Select all header */}
            <div className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground">
              <Checkbox
                checked={selectedIds.size === items.length && items.length > 0}
                onCheckedChange={toggleSelectAll}
              />
              <span>Select all</span>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-40 ml-auto">
                ⌘⇧R mark read · ⌘⌫ dismiss · Esc clear
              </span>
            </div>

            {/* Time Groups */}
            {timeGroups.map((group) => (
              <div key={group.key}>
                <div className="flex items-center gap-2 mb-2 px-3">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-50">
                    {group.label}
                  </h3>
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                    {group.items.length}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <InboxItemRow
                      key={item.id}
                      item={item}
                      isSelected={selectedIds.has(item.id)}
                      typeIcon={TYPE_ICONS[item.type]}
                      onToggleSelect={() => toggleSelect(item.id)}
                      onMarkRead={() => handleMarkRead([item.id])}
                      onDismiss={() => handleDismiss([item.id])}
                      onViewDetail={() => setDetailItem(item)}
                      onNavigate={() => handleNavigateToSource(item)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      {/* Detail Sheet */}
      <Sheet open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
        <SheetContent>
          {detailItem && (
            <InboxItemDetail
              item={detailItem}
              typeIcon={TYPE_ICONS[detailItem.type]}
              sourceIcon={SOURCE_ICONS[detailItem.source_entity]}
              onApprove={() => handleApprove(detailItem)}
              onReject={() => handleReject(detailItem)}
              onNavigate={() => handleNavigateToSource(detailItem)}
            />
          )}
        </SheetContent>
      </Sheet>
    </PageShell>
  );
}
