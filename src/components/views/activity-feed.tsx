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
import { motion, AnimatePresence } from "framer-motion";

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
  created: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  updated: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  deleted: "bg-destructive/10 text-destructive dark:bg-destructive/80/30 dark:text-destructive/80",
  commented: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  assigned: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  status_changed: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  uploaded: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
  downloaded: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
  completed: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  approved: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  rejected: "bg-destructive/10 text-destructive dark:bg-destructive/80/30 dark:text-destructive/80",
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
    <Card className={cn("border-border glass-morphism overflow-hidden shadow-2xl", className)}>
      <CardHeader className="pb-4 border-b border-border bg-background/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-black tracking-tight uppercase opacity-80 flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
            {title}
          </CardTitle>
          {showFilters && (
            <Select value={filter} onValueChange={(v) => setFilter(v as ActivityType | "all")}>
              <SelectTrigger className="w-[160px] h-8 glass-morphism border-border text-[10px] font-black uppercase tracking-widest">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="glass-morphism border-border">
                <SelectItem value="all" className="text-[10px] font-bold uppercase">All Activity</SelectItem>
                <SelectItem value="created" className="text-[10px] font-bold uppercase">Created</SelectItem>
                <SelectItem value="updated" className="text-[10px] font-bold uppercase">Updated</SelectItem>
                <SelectItem value="commented" className="text-[10px] font-bold uppercase">Comments</SelectItem>
                <SelectItem value="status_changed" className="text-[10px] font-bold uppercase">Status Changes</SelectItem>
                <SelectItem value="assigned" className="text-[10px] font-bold uppercase">Assignments</SelectItem>
                <SelectItem value="completed" className="text-[10px] font-bold uppercase">Completed</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea style={{ maxHeight }}>
          <div className="px-4 pb-4">
            <AnimatePresence mode="popLayout">
              {Object.entries(groupedActivities).map(([date, items], groupIdx) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: groupIdx * 0.1 }}
                  className="mb-8 last:mb-0"
                >
                  <div className="sticky top-0 bg-background/80 backdrop-blur-xl py-3 z-10 -mx-4 px-4 border-y border-border mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                      {date}
                    </span>
                  </div>
                  <div className="space-y-6 relative">
                    <div className="absolute top-0 bottom-0 left-[15px] w-px bg-accent" />
                    {items.map((activity, _index) => (
                      <motion.div
                        key={activity.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ x: 4 }}
                        className={cn(
                          "flex gap-4 group cursor-pointer relative z-10",
                          onActivityClick && "hover:bg-muted -mx-2 px-2 py-3 rounded-xl transition-all duration-300"
                        )}
                        onClick={() => onActivityClick?.(activity)}
                      >
                        <div className="relative">
                          <Avatar className="h-8 w-8 ring-2 ring-background border border-border">
                            <AvatarImage src={activity.user.avatar} />
                            <AvatarFallback className="text-[10px] font-black uppercase">
                              {activity.user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={cn(
                              "absolute -bottom-1 -right-1 rounded-full p-1 shadow-lg ring-2 ring-background",
                              activityColors[activity.type]
                            )}
                          >
                            {activityIcons[activity.type]}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] leading-relaxed font-medium">
                            {getActivityDescription(activity)}
                          </div>
                          {activity.metadata?.comment && (
                            <div className="mt-2 p-4 bg-muted border border-border rounded-2xl text-[12px] leading-relaxed italic opacity-80 backdrop-blur-sm">
                              &quot;{activity.metadata.comment}&quot;
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="h-3 w-3 opacity-30" />
                            <span className="text-[10px] font-black uppercase tracking-wider opacity-30">
                              {formatActivityTime(activity.timestamp)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

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
