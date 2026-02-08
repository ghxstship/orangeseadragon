'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  Check,
  CheckCircle2,
  XCircle,
  Filter,
  Clock,
  MessageSquare,
  AtSign,
  AlertTriangle,
  UserPlus,
  FileText,
  Zap,
  MoreHorizontal,
  ExternalLink,
  Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

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

interface InboxItemRowProps {
  item: InboxItem;
  isSelected: boolean;
  onToggleSelect: () => void;
  onMarkRead: () => void;
  onDismiss: () => void;
  onViewDetail: () => void;
  onNavigate: () => void;
}

function InboxItemRow({
  item,
  isSelected,
  onToggleSelect,
  onMarkRead,
  onDismiss,
  onViewDetail,
  onNavigate,
}: InboxItemRowProps) {
  const TypeIcon = TYPE_ICONS[item.type];
  const isUnread = item.status === 'unread';
  const isApproval = item.type === 'approval';
  const hasSLA = item.due_at && item.type === 'approval';

  const getSLAStatus = () => {
    if (!item.due_at) return null;
    const dueDate = new Date(item.due_at);
    const now = new Date();
    const hoursRemaining = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursRemaining < 0) return { label: 'Overdue', variant: 'destructive' as const };
    if (hoursRemaining < 4) return { label: `${Math.ceil(hoursRemaining)}h left`, variant: 'destructive' as const };
    if (hoursRemaining < 24) return { label: `${Math.ceil(hoursRemaining)}h left`, variant: 'warning' as const };
    return { label: formatDistanceToNow(dueDate, { addSuffix: true }), variant: 'secondary' as const };
  };

  const slaStatus = hasSLA ? getSLAStatus() : null;

  return (
    <div
      className={cn(
        'group flex items-start gap-3 px-3 py-3 rounded-lg border transition-colors cursor-pointer',
        isUnread ? 'bg-accent/50 border-accent' : 'border-transparent hover:bg-muted/50',
        isSelected && 'ring-2 ring-primary'
      )}
      onClick={onViewDetail}
    >
      {/* Checkbox */}
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox checked={isSelected} onCheckedChange={onToggleSelect} />
      </div>

      {/* Avatar / Icon */}
      {item.from_user ? (
        <Avatar className="h-9 w-9">
          <AvatarFallback>
            {item.from_user.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
          <TypeIcon className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={cn('text-sm truncate', isUnread && 'font-medium')}>
              {item.title}
            </p>
            {item.body && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {item.body}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {slaStatus && (
              <Badge variant={slaStatus.variant} className="text-xs">
                <Clock className="mr-1 h-3 w-3" />
                {slaStatus.label}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="text-xs">
            {item.source_entity.replace('_', ' ')}
          </Badge>
          {isApproval && item.status !== 'actioned' && (
            <Badge variant="warning" className="text-xs">
              Needs approval
            </Badge>
          )}
          {item.status === 'actioned' && (
            <Badge variant="success" className="text-xs">
              Actioned
            </Badge>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onNavigate}>
              <ExternalLink className="mr-2 h-4 w-4" />
              View Source
            </DropdownMenuItem>
            {isUnread && (
              <DropdownMenuItem onClick={onMarkRead}>
                <Check className="mr-2 h-4 w-4" />
                Mark as Read
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onDismiss}>
              Dismiss
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Unread indicator */}
      {isUnread && (
        <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-3" />
      )}
    </div>
  );
}

interface InboxItemDetailProps {
  item: InboxItem;
  onApprove: () => void;
  onReject: () => void;
  onNavigate: () => void;
}

function InboxItemDetail({ item, onApprove, onReject, onNavigate }: InboxItemDetailProps) {
  const TypeIcon = TYPE_ICONS[item.type];
  const SourceIcon = SOURCE_ICONS[item.source_entity];
  const isApproval = item.type === 'approval';
  const canAction = isApproval && item.status !== 'actioned';

  return (
    <>
      <SheetHeader>
        <div className="flex items-center gap-2">
          <TypeIcon className="h-5 w-5" />
          <SheetTitle>{item.title}</SheetTitle>
        </div>
      </SheetHeader>

      <div className="mt-6 space-y-6">
        {/* From user */}
        {item.from_user && (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {item.from_user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{item.from_user.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        )}

        {/* Body */}
        {item.body && (
          <div className="prose prose-sm dark:prose-invert">
            <p>{item.body}</p>
          </div>
        )}

        {/* Source link */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
          <SourceIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm capitalize">
            {item.source_entity.replace('_', ' ')}
          </span>
          <Button variant="link" size="sm" className="ml-auto" onClick={onNavigate}>
            View <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </div>

        {/* SLA warning */}
        {item.due_at && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <Clock className="h-4 w-4 text-amber-600" />
            <div className="text-sm">
              <span className="font-medium text-amber-800 dark:text-amber-200">
                Due {formatDistanceToNow(new Date(item.due_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        )}

        {/* Approval actions */}
        {canAction && (
          <div className="flex gap-3 pt-4 border-t">
            <Button className="flex-1" onClick={onApprove}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button variant="outline" className="flex-1" onClick={onReject}>
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </div>
        )}

        {/* Actioned state */}
        {item.status === 'actioned' && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              This item has been actioned
            </span>
          </div>
        )}
      </div>
    </>
  );
}
