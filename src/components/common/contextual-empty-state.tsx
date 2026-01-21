"use client";

import * as React from "react";
import {
  FolderOpen,
  Search,
  Filter,
  Lock,
  WifiOff,
  AlertCircle,
  Plus,
  RefreshCw,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type EmptyStateType =
  | "no-data"
  | "no-results"
  | "no-permission"
  | "offline"
  | "error"
  | "first-time";

interface ContextualEmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  icon?: React.ElementType;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const defaultConfig: Record<
  EmptyStateType,
  { icon: React.ElementType; title: string; description: string }
> = {
  "no-data": {
    icon: FolderOpen,
    title: "No items yet",
    description: "Get started by creating your first item.",
  },
  "no-results": {
    icon: Search,
    title: "No results found",
    description: "Try adjusting your search or filter criteria.",
  },
  "no-permission": {
    icon: Lock,
    title: "Access restricted",
    description: "You don't have permission to view this content.",
  },
  offline: {
    icon: WifiOff,
    title: "You're offline",
    description: "Check your internet connection and try again.",
  },
  error: {
    icon: AlertCircle,
    title: "Something went wrong",
    description: "We encountered an error. Please try again.",
  },
  "first-time": {
    icon: Sparkles,
    title: "Welcome!",
    description: "Let's get you started with a quick setup.",
  },
};

export function ContextualEmptyState({
  type,
  title,
  description,
  icon,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  children,
}: ContextualEmptyStateProps) {
  const config = defaultConfig[type];
  const Icon = icon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      <div
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-full mb-4",
          type === "error" && "bg-destructive/10 text-destructive",
          type === "no-permission" && "bg-yellow-500/10 text-yellow-600",
          type === "offline" && "bg-muted text-muted-foreground",
          type === "first-time" && "bg-primary/10 text-primary",
          (type === "no-data" || type === "no-results") &&
            "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-8 w-8" />
      </div>

      <h3 className="text-lg font-semibold mb-2">{displayTitle}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {displayDescription}
      </p>

      {children}

      {(onAction || onSecondaryAction) && (
        <div className="flex items-center gap-3">
          {onSecondaryAction && secondaryActionLabel && (
            <Button variant="outline" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
          {onAction && actionLabel && (
            <Button onClick={onAction}>
              {type === "no-data" || type === "first-time" ? (
                <Plus className="mr-2 h-4 w-4" />
              ) : type === "error" || type === "offline" ? (
                <RefreshCw className="mr-2 h-4 w-4" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Pre-configured empty states for common scenarios
export function NoDataEmptyState({
  entityName = "items",
  onCreateNew,
  className,
}: {
  entityName?: string;
  onCreateNew?: () => void;
  className?: string;
}) {
  return (
    <ContextualEmptyState
      type="no-data"
      title={`No ${entityName} yet`}
      description={`Get started by creating your first ${entityName.slice(0, -1)}.`}
      actionLabel={`Create ${entityName.slice(0, -1)}`}
      onAction={onCreateNew}
      className={className}
    />
  );
}

export function NoResultsEmptyState({
  onClearFilters,
  className,
}: {
  onClearFilters?: () => void;
  className?: string;
}) {
  return (
    <ContextualEmptyState
      type="no-results"
      icon={Filter}
      actionLabel="Clear filters"
      onAction={onClearFilters}
      className={className}
    />
  );
}

export function ErrorEmptyState({
  message,
  onRetry,
  className,
}: {
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <ContextualEmptyState
      type="error"
      description={message}
      actionLabel="Try again"
      onAction={onRetry}
      className={className}
    />
  );
}

export function OfflineEmptyState({
  onRetry,
  className,
}: {
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <ContextualEmptyState
      type="offline"
      actionLabel="Retry"
      onAction={onRetry}
      className={className}
    />
  );
}

export function NoPermissionEmptyState({
  onRequestAccess,
  className,
}: {
  onRequestAccess?: () => void;
  className?: string;
}) {
  return (
    <ContextualEmptyState
      type="no-permission"
      actionLabel="Request access"
      onAction={onRequestAccess}
      className={className}
    />
  );
}

export function FirstTimeEmptyState({
  featureName,
  onGetStarted,
  className,
}: {
  featureName?: string;
  onGetStarted?: () => void;
  className?: string;
}) {
  return (
    <ContextualEmptyState
      type="first-time"
      title={featureName ? `Welcome to ${featureName}!` : "Welcome!"}
      description="Let's get you started with a quick setup."
      actionLabel="Get started"
      onAction={onGetStarted}
      className={className}
    />
  );
}
