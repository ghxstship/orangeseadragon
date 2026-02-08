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
  draft: "bg-white/5 text-muted-foreground border-white/10",
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]",
  active: "bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]",
  completed: "bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]",
  archived: "bg-white/5 text-muted-foreground border-white/10 opacity-60",

  // Project statuses
  planning: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.2)]",
  on_hold: "bg-amber-500/10 text-amber-500 border-amber-500/20",

  // Task statuses
  backlog: "bg-white/5 text-muted-foreground/40 border-white/10",
  todo: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  in_progress: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  in_review: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  blocked: "bg-red-500/10 text-red-500 border-red-500/20",
  done: "bg-green-500/10 text-green-500 border-green-500/20",

  // Asset statuses
  available: "bg-green-500/10 text-green-500 border-green-500/20",
  in_use: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  maintenance: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  reserved: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  retired: "bg-white/5 text-muted-foreground border-white/10",
  lost: "bg-red-500/10 text-red-500 border-red-500/20",
  damaged: "bg-orange-500/10 text-orange-500 border-orange-500/20",

  // Invoice statuses
  sent: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  viewed: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  partially_paid: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  paid: "bg-green-500/10 text-green-500 border-green-500/20",
  overdue: "bg-red-500/10 text-red-500 border-red-500/20",
  disputed: "bg-orange-500/10 text-orange-500 border-orange-500/20",

  // Event phases
  concept: "bg-white/5 text-muted-foreground border-white/10",
  pre_production: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  setup: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  live: "bg-red-500/10 text-red-500 border-red-500/20 font-black tracking-[0.3em]",
  teardown: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  post_mortem: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",

  // Deal stages
  lead: "bg-white/5 text-muted-foreground border-white/10",
  qualified: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  proposal: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  negotiation: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  won: "bg-green-500/10 text-green-500 border-green-500/20",

  // Booking status
  confirmed: "bg-green-500/10 text-green-500 border-green-500/20",
  tentative: "bg-amber-500/10 text-amber-500 border-amber-500/20",

  // Approval status
  approved: "bg-green-500/10 text-green-500 border-green-500/20",
  rejected: "bg-red-500/10 text-red-500 border-red-500/20",
  review: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

export function StatusBadge({
  status,
  colorMap = {},
  className,
}: StatusBadgeProps) {
  const mergedColorMap = { ...defaultColorMap, ...colorMap };
  const colorClass = mergedColorMap[status.toLowerCase()] || "bg-gray-500";

  return (
    <Badge className={cn(colorClass, "text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg border shadow-lg", className)}>
      {formatStatus(status)}
    </Badge>
  );
}

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

const priorityColorMap: Record<string, string> = {
  urgent: "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.3)]",
  critical: "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.3)]",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  none: "bg-white/5 text-muted-foreground border-white/10",
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const colorClass = priorityColorMap[priority.toLowerCase()] || "bg-gray-500";

  return (
    <Badge className={cn(colorClass, "text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg border shadow-lg", className)}>
      {formatStatus(priority)}
    </Badge>
  );
}
