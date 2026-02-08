'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Check,
  CheckCircle2,
  Filter,
  Clock,
  MessageSquare,
  AtSign,
  AlertTriangle,
  UserPlus,
  FileText,
  Zap,
  Inbox,
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
import { InboxItemRow } from '@/components/common/inbox-item-row';
import { InboxItemDetail } from '@/components/common/inbox-item-detail';

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

export default function InboxPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState('all');
  const [items, setItems] = React.useState<InboxItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [detailItem, setDetailItem] = React.useState<InboxItem | null>(null);

  const fetchInboxItems = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab === 'unread') params.set('status', 'unread');
      if (activeTab === 'approvals') params.set('type', 'approval');
      if (activeTab === 'mentions') params.set('type', 'mention');
      if (activeTab === 'alerts') params.set('type', 'alert');

      const response = await fetch(`/api/inbox?${params}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch inbox items:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  React.useEffect(() => {
    fetchInboxItems();
  }, [fetchInboxItems]);

  const handleMarkRead = async (ids: string[]) => {
    try {
      await fetch('/api/inbox/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      setItems((prev) =>
        prev.map((item) =>
          ids.includes(item.id) ? { ...item, status: 'read' as InboxItemStatus } : item
        )
      );
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Failed to mark as read:', error);
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
      await fetch(`/api/inbox/${item.id}/approve`, { method: 'POST' });
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'actioned' as InboxItemStatus } : i))
      );
      setDetailItem(null);
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  const handleReject = async (item: InboxItem) => {
    try {
      await fetch(`/api/inbox/${item.id}/reject`, { method: 'POST' });
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'actioned' as InboxItemStatus } : i))
      );
      setDetailItem(null);
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  };

  const handleDismiss = async (ids: string[]) => {
    try {
      await fetch('/api/inbox/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      setItems((prev) => prev.filter((item) => !ids.includes(item.id)));
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Failed to dismiss:', error);
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

  const tabCounts: Record<string, number> = {
    all: items.length,
    unread: unreadCount,
    approvals: approvalCount,
    mentions: items.filter((i) => i.type === 'mention').length,
    alerts: items.filter((i) => i.type === 'alert').length,
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
          <p className="text-sm text-muted-foreground">
            Notifications, approvals & action items
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 ? (
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
                Dismiss ({selectedIds.size})
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
              >
                <Check className="mr-2 h-4 w-4" />
                Mark all read
              </Button>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

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
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            Alerts
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Loading State */}
      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Inbox className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">You&apos;re all caught up!</h3>
          <p className="text-sm text-muted-foreground mt-1">
            New notifications will appear here.
          </p>
        </div>
      )}

      {/* Item List */}
      {!loading && items.length > 0 && (
        <div className="space-y-1">
          {/* Select all header */}
          <div className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground">
            <Checkbox
              checked={selectedIds.size === items.length && items.length > 0}
              onCheckedChange={toggleSelectAll}
            />
            <span>Select all</span>
          </div>

          {/* Items */}
          {items.map((item) => (
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
    </div>
  );
}
