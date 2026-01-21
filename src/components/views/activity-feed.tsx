"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Settings,
  Upload,
  Download,
  Trash2,
  Edit,
  Plus,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { formatDistanceToNow, format, parseISO, isToday, isYesterday } from "date-fns";

export type ActivityType =
  | "created"
  | "updated"
  | "deleted"
  | "commented"
  | "assigned"
  | "status_changed"
  | "uploaded"
  | "downloaded"
  | "completed"
  | "approved"
  | "rejected"
  | "mentioned"
  | "settings_changed";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  timestamp: string | Date;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  entity?: {
    type: string;
    id: string;
    name: string;
  };
  metadata?: {
    field?: string;
    oldValue?: string;
    newValue?: string;
    comment?: string;
    fileName?: string;
    assignee?: string;
  };
}

export interface ActivityFeedProps {
  activities: ActivityItem[];
  title?: string;
  className?: string;
  maxHeight?: number;
  showFilters?: boolean;
  onActivityClick?: (activity: ActivityItem) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}

const activityIcons: Record<ActivityType, React.ReactNode> = {
  created: <Plus className="h-4 w-4" />,
  updated: <Edit className="h-4 w-4" />,
  deleted: <Trash2 className="h-4 w-4" />,
  commented: <MessageSquare className="h-4 w-4" />,
  assigned: <User className="h-4 w-4" />,
  status_changed: <ArrowRight className="h-4 w-4" />,
  uploaded: <Upload className="h-4 w-4" />,
  downloaded: <Download className="h-4 w-4" />,
  completed: <CheckCircle2 className="h-4 w-4" />,
  approved: <CheckCircle2 className="h-4 w-4" />,
  rejected: <AlertCircle className="h-4 w-4" />,
  mentioned: <MessageSquare className="h-4 w-4" />,
  settings_changed: <Settings className="h-4 w-4" />,
};

const activityColors: Record<ActivityType, string> = {
  created: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  updated: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  deleted: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  commented: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  assigned: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  status_changed: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
  uploaded: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
  downloaded: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
  completed: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  approved: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  mentioned: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  settings_changed: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400",
};

function getActivityDescription(activity: ActivityItem): React.ReactNode {
  const { type, user, entity, metadata } = activity;
  const entityLink = entity ? (
    <span className="font-medium text-foreground">{entity.name}</span>
  ) : null;

  switch (type) {
    case "created":
      return (
        <>
          <span className="font-medium">{user.name}</span> created {entityLink}
        </>
      );
    case "updated":
      if (metadata?.field) {
        return (
          <>
            <span className="font-medium">{user.name}</span> updated{" "}
            <span className="text-muted-foreground">{metadata.field}</span> on {entityLink}
          </>
        );
      }
      return (
        <>
          <span className="font-medium">{user.name}</span> updated {entityLink}
        </>
      );
    case "deleted":
      return (
        <>
          <span className="font-medium">{user.name}</span> deleted {entityLink}
        </>
      );
    case "commented":
      return (
        <>
          <span className="font-medium">{user.name}</span> commented on {entityLink}
        </>
      );
    case "assigned":
      return (
        <>
          <span className="font-medium">{user.name}</span> assigned{" "}
          <span className="font-medium">{metadata?.assignee}</span> to {entityLink}
        </>
      );
    case "status_changed":
      return (
        <>
          <span className="font-medium">{user.name}</span> changed status from{" "}
          <Badge variant="outline" className="mx-1 text-xs">
            {metadata?.oldValue}
          </Badge>
          to
          <Badge variant="outline" className="mx-1 text-xs">
            {metadata?.newValue}
          </Badge>
        </>
      );
    case "uploaded":
      return (
        <>
          <span className="font-medium">{user.name}</span> uploaded{" "}
          <span className="font-medium">{metadata?.fileName}</span>
        </>
      );
    case "downloaded":
      return (
        <>
          <span className="font-medium">{user.name}</span> downloaded{" "}
          <span className="font-medium">{metadata?.fileName}</span>
        </>
      );
    case "completed":
      return (
        <>
          <span className="font-medium">{user.name}</span> completed {entityLink}
        </>
      );
    case "approved":
      return (
        <>
          <span className="font-medium">{user.name}</span> approved {entityLink}
        </>
      );
    case "rejected":
      return (
        <>
          <span className="font-medium">{user.name}</span> rejected {entityLink}
        </>
      );
    case "mentioned":
      return (
        <>
          <span className="font-medium">{user.name}</span> mentioned you in {entityLink}
        </>
      );
    case "settings_changed":
      return (
        <>
          <span className="font-medium">{user.name}</span> changed settings
        </>
      );
    default:
      return (
        <>
          <span className="font-medium">{user.name}</span> performed an action
        </>
      );
  }
}

function formatActivityTime(timestamp: string | Date): string {
  const date = typeof timestamp === "string" ? parseISO(timestamp) : timestamp;
  return formatDistanceToNow(date, { addSuffix: true });
}

function getDateGroup(timestamp: string | Date): string {
  const date = typeof timestamp === "string" ? parseISO(timestamp) : timestamp;
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
}

export function ActivityFeed({
  activities,
  title = "Activity",
  className,
  maxHeight = 600,
  showFilters = true,
  onActivityClick,
  onLoadMore,
  hasMore = false,
  loading = false,
}: ActivityFeedProps) {
  const [filter, setFilter] = React.useState<ActivityType | "all">("all");

  const filteredActivities = React.useMemo(() => {
    if (filter === "all") return activities;
    return activities.filter((a) => a.type === filter);
  }, [activities, filter]);

  const groupedActivities = React.useMemo(() => {
    const groups: Record<string, ActivityItem[]> = {};
    filteredActivities.forEach((activity) => {
      const group = getDateGroup(activity.timestamp);
      if (!groups[group]) groups[group] = [];
      groups[group].push(activity);
    });
    return groups;
  }, [filteredActivities]);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {title}
          </CardTitle>
          {showFilters && (
            <Select value={filter} onValueChange={(v) => setFilter(v as ActivityType | "all")}>
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activity</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="updated">Updated</SelectItem>
                <SelectItem value="commented">Comments</SelectItem>
                <SelectItem value="status_changed">Status Changes</SelectItem>
                <SelectItem value="assigned">Assignments</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea style={{ maxHeight }}>
          <div className="px-4 pb-4">
            {Object.entries(groupedActivities).map(([date, items]) => (
              <div key={date} className="mb-6 last:mb-0">
                <div className="sticky top-0 bg-background py-2 z-10">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {date}
                  </span>
                </div>
                <div className="space-y-4">
                  {items.map((activity, index) => (
                    <div
                      key={activity.id}
                      className={cn(
                        "flex gap-3 group cursor-pointer",
                        onActivityClick && "hover:bg-muted/50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                      )}
                      onClick={() => onActivityClick?.(activity)}
                    >
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={activity.user.avatar} />
                          <AvatarFallback className="text-xs">
                            {activity.user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={cn(
                            "absolute -bottom-1 -right-1 rounded-full p-1",
                            activityColors[activity.type]
                          )}
                        >
                          {activityIcons[activity.type]}
                        </div>
                        {index < items.length - 1 && (
                          <div className="absolute top-10 left-4 w-px h-6 bg-border" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-relaxed">
                          {getActivityDescription(activity)}
                        </p>
                        {activity.metadata?.comment && (
                          <div className="mt-2 p-3 bg-muted rounded-lg text-sm">
                            {activity.metadata.comment}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatActivityTime(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {filteredActivities.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No activity to show</p>
              </div>
            )}

            {hasMore && (
              <div className="pt-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLoadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
