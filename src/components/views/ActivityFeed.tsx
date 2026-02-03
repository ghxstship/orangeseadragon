"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  MessageCircle,
  Phone,
  Mail,
  Users,
  CheckSquare,
  FileText,
  CheckCircle,
  RefreshCw,
  StickyNote,
  Presentation,
  Activity,
  Filter,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Types
export type ActivityType =
  | "comment"
  | "note"
  | "call"
  | "email"
  | "meeting"
  | "task"
  | "demo"
  | "proposal"
  | "approval"
  | "status_change";

export type ActivityCategory =
  | "crm"
  | "task"
  | "document"
  | "workflow"
  | "support"
  | "system";

export interface ActivityItem {
  id: string;
  activityType: ActivityType;
  activityCategory: ActivityCategory;
  entityType: string | null;
  entityId: string | null;
  entityName: string | null;
  entityPath: string | null;
  actorId: string | null;
  actorName: string | null;
  title: string;
  content: string | null;
  metadata: Record<string, unknown> | null;
  projectId: string | null;
  eventId: string | null;
  companyId: string | null;
  dealId: string | null;
  visibility: string | null;
  activityAt: string;
  createdAt: string | null;
  categoryLabel: string;
  categoryColor: string;
  typeLabel: string;
  typeIcon: string;
}

export interface ActivityFeedResponse {
  items: ActivityItem[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface ActivityFeedProps {
  className?: string;
  entityType?: string;
  entityId?: string;
  projectId?: string;
  eventId?: string;
  companyId?: string;
  dealId?: string;
  limit?: number;
  showFilters?: boolean;
  compact?: boolean;
}

const ICON_MAP: Record<string, React.ElementType> = {
  "message-circle": MessageCircle,
  "sticky-note": StickyNote,
  phone: Phone,
  mail: Mail,
  users: Users,
  "check-square": CheckSquare,
  presentation: Presentation,
  "file-text": FileText,
  "check-circle": CheckCircle,
  "refresh-cw": RefreshCw,
  activity: Activity,
};

export function ActivityFeed({
  className,
  entityType,
  entityId,
  projectId,
  eventId,
  companyId,
  dealId,
  limit = 50,
  showFilters = true,
  compact = false,
}: ActivityFeedProps) {
  const router = useRouter();
  const [items, setItems] = React.useState<ActivityItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [hasMore, setHasMore] = React.useState(false);
  const [offset, setOffset] = React.useState(0);
  const [total, setTotal] = React.useState(0);

  // Filters
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");

  const fetchActivities = React.useCallback(
    async (append = false) => {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: append ? offset.toString() : "0",
      });

      if (entityType) params.set("entityType", entityType);
      if (entityId) params.set("entityId", entityId);
      if (projectId) params.set("projectId", projectId);
      if (eventId) params.set("eventId", eventId);
      if (companyId) params.set("companyId", companyId);
      if (dealId) params.set("dealId", dealId);
      if (categoryFilter !== "all") params.set("activityCategory", categoryFilter);
      if (typeFilter !== "all") params.set("activityType", typeFilter);

      try {
        const response = await fetch(`/api/activity/feed?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch activity feed");
        }
        const result: ActivityFeedResponse = await response.json();

        if (append) {
          setItems((prev) => [...prev, ...result.items]);
        } else {
          setItems(result.items);
        }
        setHasMore(result.pagination.hasMore);
        setTotal(result.pagination.total);
        setOffset(result.pagination.offset + result.pagination.limit);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [
      limit,
      offset,
      entityType,
      entityId,
      projectId,
      eventId,
      companyId,
      dealId,
      categoryFilter,
      typeFilter,
    ]
  );

  React.useEffect(() => {
    setOffset(0);
    fetchActivities(false);
  }, [categoryFilter, typeFilter, entityType, entityId, projectId, eventId, companyId, dealId]);

  const loadMore = () => {
    fetchActivities(true);
  };

  const handleItemClick = (item: ActivityItem) => {
    if (item.entityPath) {
      router.push(item.entityPath);
    }
  };

  const getInitials = (name: string | null): string => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderIcon = (iconName: string) => {
    const Icon = ICON_MAP[iconName] || Activity;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Activity</h2>
          <Badge variant="secondary" className="text-xs">
            {total} items
          </Badge>
        </div>

        {showFilters && (
          <div className="flex items-center gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px] h-8">
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="crm">CRM</SelectItem>
                <SelectItem value="task">Tasks</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
                <SelectItem value="workflow">Workflows</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="comment">Comments</SelectItem>
                <SelectItem value="call">Calls</SelectItem>
                <SelectItem value="email">Emails</SelectItem>
                <SelectItem value="meeting">Meetings</SelectItem>
                <SelectItem value="approval">Approvals</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchActivities(false)}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <p className="text-sm font-medium">Failed to load activity</p>
          <p className="text-xs mt-1">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => fetchActivities(false)}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading && items.length === 0 && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Activity List */}
      {items.length > 0 && (
        <div className="space-y-1">
          {items.map((item, index) => (
            <ActivityItem
              key={item.id}
              item={item}
              compact={compact}
              isLast={index === items.length - 1}
              onClick={() => handleItemClick(item)}
              renderIcon={renderIcon}
              getInitials={getInitials}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && !error && (
        <div className="text-center py-8 text-muted-foreground">
          <Activity className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium">No activity yet</p>
          <p className="text-xs mt-1">Activity will appear here as it happens</p>
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadMore}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}

interface ActivityItemProps {
  item: ActivityItem;
  compact: boolean;
  isLast: boolean;
  onClick: () => void;
  renderIcon: (iconName: string) => React.ReactNode;
  getInitials: (name: string | null) => string;
}

function ActivityItem({
  item,
  compact,
  isLast,
  onClick,
  renderIcon,
  getInitials,
}: ActivityItemProps) {
  return (
    <div
      className={cn(
        "group flex gap-3 p-3 rounded-lg transition-colors",
        "hover:bg-muted/50 cursor-pointer",
        !isLast && "border-b border-border/50"
      )}
      onClick={onClick}
    >
      {/* Avatar */}
      <div className="relative">
        <Avatar className="h-8 w-8">
          <AvatarFallback
            className="text-xs"
            style={{ backgroundColor: `${item.categoryColor}20`, color: item.categoryColor }}
          >
            {getInitials(item.actorName)}
          </AvatarFallback>
        </Avatar>
        <div
          className="absolute -bottom-1 -right-1 rounded-full p-0.5 bg-background border"
          style={{ color: item.categoryColor }}
        >
          {renderIcon(item.typeIcon)}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{item.title}</p>
            {!compact && item.content && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {item.content}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(item.activityAt), { addSuffix: true })}
            </span>
            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          {item.actorName && <span>{item.actorName}</span>}
          {item.actorName && item.entityName && <span>•</span>}
          {item.entityName && (
            <span className="truncate max-w-[200px]">{item.entityName}</span>
          )}
          <Badge
            variant="outline"
            className="h-4 text-[10px] px-1"
            style={{ borderColor: `${item.categoryColor}50`, color: item.categoryColor }}
          >
            {item.categoryLabel}
          </Badge>
        </div>
      </div>
    </div>
  );
}

// Export for use in detail panels
export function ActivityFeedCompact(props: Omit<ActivityFeedProps, "compact" | "showFilters">) {
  return <ActivityFeed {...props} compact showFilters={false} limit={10} />;
}
