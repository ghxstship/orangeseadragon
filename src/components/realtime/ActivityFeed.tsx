"use client";

import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowRight,
  UserPlus,
  MessageSquare,
  AtSign,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import type { ActivityLogEntry, ActivityAction } from "@/lib/realtime/types";

interface ActivityFeedProps {
  activities: ActivityLogEntry[];
  loading?: boolean;
  maxHeight?: string;
  showEntityLink?: boolean;
  onEntityClick?: (entityType: string, entityId: string) => void;
  className?: string;
}

const actionIcons: Record<ActivityAction, React.ReactNode> = {
  created: <Plus className="h-3.5 w-3.5" />,
  updated: <Pencil className="h-3.5 w-3.5" />,
  deleted: <Trash2 className="h-3.5 w-3.5" />,
  status_changed: <ArrowRight className="h-3.5 w-3.5" />,
  assigned: <UserPlus className="h-3.5 w-3.5" />,
  commented: <MessageSquare className="h-3.5 w-3.5" />,
  mentioned: <AtSign className="h-3.5 w-3.5" />,
  approved: <CheckCircle className="h-3.5 w-3.5" />,
  rejected: <XCircle className="h-3.5 w-3.5" />,
  completed: <CheckCircle className="h-3.5 w-3.5" />,
  started: <Play className="h-3.5 w-3.5" />,
  paused: <Pause className="h-3.5 w-3.5" />,
  resumed: <RotateCcw className="h-3.5 w-3.5" />,
};

const actionColors: Record<ActivityAction, string> = {
  created: "bg-green-500/10 text-green-600",
  updated: "bg-blue-500/10 text-blue-600",
  deleted: "bg-red-500/10 text-red-600",
  status_changed: "bg-purple-500/10 text-purple-600",
  assigned: "bg-amber-500/10 text-amber-600",
  commented: "bg-sky-500/10 text-sky-600",
  mentioned: "bg-pink-500/10 text-pink-600",
  approved: "bg-emerald-500/10 text-emerald-600",
  rejected: "bg-red-500/10 text-red-600",
  completed: "bg-emerald-500/10 text-emerald-600",
  started: "bg-blue-500/10 text-blue-600",
  paused: "bg-amber-500/10 text-amber-600",
  resumed: "bg-blue-500/10 text-blue-600",
};

const actionLabels: Record<ActivityAction, string> = {
  created: "created",
  updated: "updated",
  deleted: "deleted",
  status_changed: "changed status of",
  assigned: "assigned",
  commented: "commented on",
  mentioned: "mentioned you in",
  approved: "approved",
  rejected: "rejected",
  completed: "completed",
  started: "started",
  paused: "paused",
  resumed: "resumed",
};

function formatEntityType(entityType: string): string {
  return entityType.replace(/_/g, " ");
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ActivityFeed({
  activities,
  loading = false,
  maxHeight = "400px",
  showEntityLink = true,
  onEntityClick,
  className,
}: ActivityFeedProps) {
  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-8 text-center", className)}>
        <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
        <p className="mt-2 text-sm text-muted-foreground">No activity yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className={className} style={{ maxHeight }}>
      <div className="space-y-4 pr-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={activity.userAvatarUrl} alt={activity.userName} />
              <AvatarFallback className="text-xs">
                {getInitials(activity.userName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2">
                <span
                  className={cn(
                    "inline-flex items-center justify-center h-5 w-5 rounded-full shrink-0",
                    actionColors[activity.action]
                  )}
                >
                  {actionIcons[activity.action]}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{activity.userName}</span>{" "}
                    <span className="text-muted-foreground">
                      {actionLabels[activity.action]}
                    </span>{" "}
                    {showEntityLink && onEntityClick ? (
                      <button
                        onClick={() => onEntityClick(activity.entityType, activity.entityId)}
                        className="font-medium text-primary hover:underline"
                      >
                        {activity.entityName}
                      </button>
                    ) : (
                      <span className="font-medium">{activity.entityName}</span>
                    )}
                    {!showEntityLink && (
                      <span className="text-muted-foreground">
                        {" "}
                        ({formatEntityType(activity.entityType)})
                      </span>
                    )}
                  </p>

                  {activity.changes && Object.keys(activity.changes).length > 0 && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {Object.entries(activity.changes)
                        .slice(0, 3)
                        .map(([field, change]) => (
                          <div key={field} className="truncate">
                            <span className="font-medium">{field.replace(/_/g, " ")}</span>:{" "}
                            {String(change.old ?? "—")} → {String(change.new ?? "—")}
                          </div>
                        ))}
                      {Object.keys(activity.changes).length > 3 && (
                        <div className="text-muted-foreground/70">
                          +{Object.keys(activity.changes).length - 3} more changes
                        </div>
                      )}
                    </div>
                  )}

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

interface ActivityFeedCompactProps {
  activities: ActivityLogEntry[];
  maxItems?: number;
  className?: string;
}

export function ActivityFeedCompact({
  activities,
  maxItems = 5,
  className,
}: ActivityFeedCompactProps) {
  const visibleActivities = activities.slice(0, maxItems);

  return (
    <div className={cn("space-y-2", className)}>
      {visibleActivities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <span
            className={cn(
              "inline-flex items-center justify-center h-4 w-4 rounded-full shrink-0",
              actionColors[activity.action]
            )}
          >
            {actionIcons[activity.action]}
          </span>
          <span className="truncate">
            <span className="font-medium text-foreground">{activity.userName}</span>{" "}
            {actionLabels[activity.action]} {activity.entityName}
          </span>
          <span className="shrink-0 text-xs">
            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
          </span>
        </div>
      ))}
    </div>
  );
}
