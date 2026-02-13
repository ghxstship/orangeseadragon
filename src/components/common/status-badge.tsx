import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatStatus } from "@/lib/formatters";
import { getStatusBadgeClasses, getPriorityBadgeClasses } from "@/lib/tokens/semantic-colors";

interface StatusBadgeProps {
  status: string;
  colorMap?: Record<string, string>;
  className?: string;
}

const BADGE_BASE = "text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg border shadow-lg";

export function StatusBadge({
  status,
  colorMap = {},
  className,
}: StatusBadgeProps) {
  const override = colorMap[status.toLowerCase()];
  const colorClass = override || getStatusBadgeClasses(status);
  const extra = status.toLowerCase() === "live" ? "font-black tracking-[0.3em]" : "";
  const dimmed = status.toLowerCase() === "archived" ? "opacity-60" : "";

  return (
    <Badge className={cn(colorClass, BADGE_BASE, extra, dimmed, className)}>
      {formatStatus(status)}
    </Badge>
  );
}

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const colorClass = getPriorityBadgeClasses(priority);

  return (
    <Badge className={cn(colorClass, BADGE_BASE, className)}>
      {formatStatus(priority)}
    </Badge>
  );
}
