"use client";

import * as React from "react";
import { X, Trash2, Archive, Tag, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ElementType;
  variant?: "default" | "destructive";
  onClick: (selectedIds: string[]) => void;
}

interface BulkActionsProps {
  selectedCount: number;
  selectedIds: string[];
  onClearSelection: () => void;
  actions: BulkAction[];
  maxVisibleActions?: number;
  className?: string;
}

export function BulkActions({
  selectedCount,
  selectedIds,
  onClearSelection,
  actions,
  maxVisibleActions = 3,
  className,
}: BulkActionsProps) {
  if (selectedCount === 0) return null;

  const visibleActions = actions.slice(0, maxVisibleActions);
  const overflowActions = actions.slice(maxVisibleActions);

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
        "flex items-center gap-2 rounded-lg border bg-background p-2 shadow-lg",
        "animate-in slide-in-from-bottom-4 fade-in-0",
        className
      )}
    >
      <div className="flex items-center gap-2 px-2">
        <span className="text-sm font-medium">
          {selectedCount} selected
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onClearSelection}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-6 w-px bg-border" />

      <div className="flex items-center gap-1">
        {visibleActions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              variant={action.variant === "destructive" ? "destructive" : "ghost"}
              size="sm"
              onClick={() => action.onClick(selectedIds)}
              className="gap-2"
            >
              {Icon && <Icon className="h-4 w-4" />}
              {action.label}
            </Button>
          );
        })}

        {overflowActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {overflowActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <React.Fragment key={action.id}>
                    {index > 0 && action.variant === "destructive" && (
                      <DropdownMenuSeparator />
                    )}
                    <DropdownMenuItem
                      onClick={() => action.onClick(selectedIds)}
                      className={cn(
                        action.variant === "destructive" && "text-destructive"
                      )}
                    >
                      {Icon && <Icon className="mr-2 h-4 w-4" />}
                      {action.label}
                    </DropdownMenuItem>
                  </React.Fragment>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

export const defaultBulkActions: BulkAction[] = [
  {
    id: "archive",
    label: "Archive",
    icon: Archive,
    onClick: (ids) => console.log("Archive:", ids),
  },
  {
    id: "tag",
    label: "Add Tag",
    icon: Tag,
    onClick: (ids) => console.log("Tag:", ids),
  },
  {
    id: "delete",
    label: "Delete",
    icon: Trash2,
    variant: "destructive",
    onClick: (ids) => console.log("Delete:", ids),
  },
];
