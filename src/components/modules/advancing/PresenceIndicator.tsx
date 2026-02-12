'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { PresenceState } from '@/lib/realtime/types';

interface PresenceIndicatorProps {
  users: PresenceState[];
  maxVisible?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
};

const ringColors = {
  viewing: 'ring-blue-500',
  editing: 'ring-emerald-500',
};

export function PresenceIndicator({
  users,
  maxVisible = 3,
  size = 'md',
  className,
}: PresenceIndicatorProps) {
  if (users.length === 0) return null;

  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = users.length - maxVisible;

  return (
    <TooltipProvider>
      <div className={cn("flex items-center -space-x-2", className)}>
        {visibleUsers.map((user) => (
          <Tooltip key={user.userId}>
            <TooltipTrigger asChild>
              <div className="relative">
                <Avatar
                  className={cn(
                    sizeClasses[size],
                    "ring-2 ring-offset-2 ring-offset-background",
                    ringColors[user.action]
                  )}
                >
                  <AvatarImage src={user.avatarUrl} alt={user.userName} />
                  <AvatarFallback className="font-medium">
                    {user.userName?.charAt(0)?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                {user.action === 'editing' && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="font-medium">{user.userName}</p>
              <p className="text-xs text-muted-foreground">
                {user.action === 'editing' ? 'Currently editing' : 'Viewing'}
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
                  "flex items-center justify-center rounded-full bg-muted ring-2 ring-offset-2 ring-offset-background ring-muted-foreground/20 font-medium"
                )}
              >
                +{remainingCount}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="font-medium">{remainingCount} more</p>
              <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
                {users.slice(maxVisible).map((user) => (
                  <p key={user.userId}>
                    {user.userName} ({user.action})
                  </p>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

interface CollaborationBannerProps {
  users: PresenceState[];
  entityName?: string;
  className?: string;
}

export function CollaborationBanner({
  users,
  entityName = 'this item',
  className,
}: CollaborationBannerProps) {
  const editingUsers = users.filter(u => u.action === 'editing');
  const viewingUsers = users.filter(u => u.action === 'viewing');

  if (users.length === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-2 rounded-lg border",
        editingUsers.length > 0
          ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
          : "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800",
        className
      )}
    >
      <PresenceIndicator users={users} size="sm" />
      
      <div className="flex-1 min-w-0">
        {editingUsers.length > 0 ? (
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <span className="font-medium">
              {editingUsers.map(u => u.userName).join(', ')}
            </span>
            {' '}
            {editingUsers.length === 1 ? 'is' : 'are'} editing {entityName}
          </p>
        ) : (
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <span className="font-medium">
              {viewingUsers.length} {viewingUsers.length === 1 ? 'person' : 'people'}
            </span>
            {' '}viewing {entityName}
          </p>
        )}
      </div>
    </div>
  );
}

interface LiveCursorsProps {
  users: PresenceState[];
}

export function LiveCursors({ users }: LiveCursorsProps) {
  const cursorsWithPosition = users.filter(u => u.cursor && u.action === 'editing');

  if (cursorsWithPosition.length === 0) return null;

  return (
    <>
      {cursorsWithPosition.map((user) => {
        if (!user.cursor) return null;

        return (
          <div
            key={user.userId}
            className="pointer-events-none absolute z-50 transition-all duration-75"
            style={{
              left: user.cursor.x,
              top: user.cursor.y,
            }}
          >
            {/* Cursor arrow */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="drop-shadow-md"
            >
              <path
                d="M5.65376 12.4563L11.9998 3L18.3459 12.4563H5.65376Z"
                fill="currentColor"
                className="text-primary"
                transform="rotate(-45 12 12)"
              />
            </svg>
            
            {/* User label */}
            <div className="absolute left-4 top-4 px-2 py-0.5 rounded bg-primary text-primary-foreground text-xs font-medium whitespace-nowrap shadow-md">
              {user.userName}
            </div>
          </div>
        );
      })}
    </>
  );
}
