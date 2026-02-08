"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { PresenceState } from "@/lib/realtime/types";

interface PresenceIndicatorProps {
  users: PresenceState[];
  maxVisible?: number;
  size?: "sm" | "md" | "lg";
  showStatus?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
};

const statusColors = {
  viewing: "bg-green-500",
  editing: "bg-amber-500",
};

export function PresenceIndicator({
  users,
  maxVisible = 5,
  size = "md",
  showStatus = true,
  className,
}: PresenceIndicatorProps) {
  if (users.length === 0) return null;

  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = users.length - maxVisible;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <TooltipProvider>
      <div className={cn("flex items-center -space-x-2", className)}>
        {visibleUsers.map((user) => (
          <Tooltip key={user.oderId}>
            <TooltipTrigger asChild>
              <div className="relative">
                <Avatar
                  className={cn(
                    sizeClasses[size],
                    "border-2 border-background ring-0 transition-transform hover:z-10 hover:scale-110"
                  )}
                >
                  <AvatarImage src={user.avatarUrl} alt={user.userName} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(user.userName)}
                  </AvatarFallback>
                </Avatar>
                {showStatus && (
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background",
                      statusColors[user.action]
                    )}
                  />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <p className="font-medium">{user.userName}</p>
              <p className="text-muted-foreground">
                {user.action === "editing" ? "Editing" : "Viewing"}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}

        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  sizeClasses[size],
                  "flex items-center justify-center rounded-full border-2 border-background bg-muted text-muted-foreground"
                )}
              >
                +{remainingCount}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <p className="font-medium">{remainingCount} more users</p>
              <ul className="mt-1 space-y-0.5">
                {users.slice(maxVisible).map((user) => (
                  <li key={user.oderId} className="text-muted-foreground">
                    {user.userName}
                  </li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

interface PresenceBadgeProps {
  count: number;
  className?: string;
}

export function PresenceBadge({ count, className }: PresenceBadgeProps) {
  if (count === 0) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600",
        className
      )}
    >
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
      {count} {count === 1 ? "user" : "users"} online
    </span>
  );
}
