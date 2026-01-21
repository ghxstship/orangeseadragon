import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatStatus } from "@/lib/formatters";

interface StatusBadgeProps {
  status: string;
  colorMap?: Record<string, string>;
  className?: string;
}

const defaultColorMap: Record<string, string> = {
  // General statuses
  draft: "bg-gray-500",
  pending: "bg-yellow-500",
  active: "bg-green-500",
  completed: "bg-blue-500",
  cancelled: "bg-red-500",
  archived: "bg-gray-400",

  // Project statuses
  planning: "bg-blue-500",
  on_hold: "bg-yellow-500",

  // Task statuses
  backlog: "bg-gray-500",
  todo: "bg-blue-500",
  in_progress: "bg-yellow-500",
  in_review: "bg-purple-500",
  blocked: "bg-red-500",
  done: "bg-green-500",

  // Asset statuses
  available: "bg-green-500",
  in_use: "bg-blue-500",
  maintenance: "bg-yellow-500",
  reserved: "bg-purple-500",
  retired: "bg-gray-500",
  lost: "bg-red-500",
  damaged: "bg-orange-500",

  // Invoice statuses
  sent: "bg-blue-500",
  viewed: "bg-cyan-500",
  partially_paid: "bg-yellow-500",
  paid: "bg-green-500",
  overdue: "bg-red-500",
  disputed: "bg-orange-500",

  // Event phases
  concept: "bg-gray-500",
  pre_production: "bg-yellow-500",
  setup: "bg-orange-500",
  live: "bg-red-500",
  teardown: "bg-purple-500",
  post_mortem: "bg-indigo-500",

  // Deal stages
  lead: "bg-gray-500",
  qualified: "bg-blue-500",
  proposal: "bg-yellow-500",
  negotiation: "bg-purple-500",
  won: "bg-green-500",

  // Booking status
  confirmed: "bg-green-500",
  tentative: "bg-yellow-500",

  // Approval status
  approved: "bg-green-500",
  rejected: "bg-red-500",
  review: "bg-yellow-500",
};

export function StatusBadge({
  status,
  colorMap = {},
  className,
}: StatusBadgeProps) {
  const mergedColorMap = { ...defaultColorMap, ...colorMap };
  const colorClass = mergedColorMap[status.toLowerCase()] || "bg-gray-500";

  return (
    <Badge className={cn(colorClass, "text-white", className)}>
      {formatStatus(status)}
    </Badge>
  );
}

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

const priorityColorMap: Record<string, string> = {
  urgent: "bg-red-500",
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-blue-500",
  none: "bg-gray-500",
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const colorClass = priorityColorMap[priority.toLowerCase()] || "bg-gray-500";

  return (
    <Badge className={cn(colorClass, "text-white", className)}>
      {formatStatus(priority)}
    </Badge>
  );
}
