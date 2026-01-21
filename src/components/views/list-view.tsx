"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { MoreHorizontal, ChevronRight, GripVertical } from "lucide-react";

export interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  avatar?: string;
  avatarFallback?: string;
  badge?: {
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  status?: {
    label: string;
    color?: string;
  };
  meta?: Array<{
    label: string;
    value: string;
  }>;
  actions?: Array<{
    label: string;
    onClick: () => void;
    destructive?: boolean;
  }>;
  data?: Record<string, unknown>;
}

export interface ListViewProps<T extends ListItem> {
  items: T[];
  title?: string;
  emptyMessage?: string;
  loading?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onItemClick?: (item: T) => void;
  showChevron?: boolean;
  draggable?: boolean;
  onReorder?: (items: T[]) => void;
  renderItem?: (item: T) => React.ReactNode;
  className?: string;
}

export function ListView<T extends ListItem>({
  items,
  title,
  emptyMessage = "No items found",
  loading = false,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  onItemClick,
  showChevron = false,
  draggable = false,
  renderItem,
  className,
}: ListViewProps<T>) {
  const handleSelectAll = () => {
    if (selectedIds.length === items.length) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(items.map((item) => item.id));
    }
  };

  const handleSelectItem = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange?.(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange?.([...selectedIds, id]);
    }
  };

  const isAllSelected = items.length > 0 && selectedIds.length === items.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < items.length;

  if (loading) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent className="p-0">
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {title && (
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {selectable && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isAllSelected}
                ref={(el) => {
                  if (el) {
                    (el as HTMLButtonElement & { indeterminate: boolean }).indeterminate = isSomeSelected;
                  }
                }}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                {selectedIds.length > 0
                  ? `${selectedIds.length} selected`
                  : "Select all"}
              </span>
            </div>
          )}
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="divide-y">
          {items.map((item) => {
            if (renderItem) {
              return (
                <div key={item.id} className="p-4">
                  {renderItem(item)}
                </div>
              );
            }

            const isSelected = selectedIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-4 p-4 transition-colors",
                  onItemClick && "cursor-pointer hover:bg-muted/50",
                  isSelected && "bg-muted/30"
                )}
                onClick={() => onItemClick?.(item)}
              >
                {draggable && (
                  <div className="cursor-grab text-muted-foreground hover:text-foreground">
                    <GripVertical className="h-4 w-4" />
                  </div>
                )}

                {selectable && (
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleSelectItem(item.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}

                {(item.avatar || item.avatarFallback) && (
                  <Avatar>
                    <AvatarImage src={item.avatar} alt={item.title} />
                    <AvatarFallback>
                      {item.avatarFallback ||
                        item.title
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{item.title}</span>
                    {item.badge && (
                      <Badge variant={item.badge.variant || "secondary"}>
                        {item.badge.label}
                      </Badge>
                    )}
                    {item.status && (
                      <div className="flex items-center gap-1.5">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: item.status.color || "#888" }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {item.status.label}
                        </span>
                      </div>
                    )}
                  </div>
                  {item.subtitle && (
                    <p className="text-sm text-muted-foreground truncate">
                      {item.subtitle}
                    </p>
                  )}
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {item.description}
                    </p>
                  )}
                  {item.meta && item.meta.length > 0 && (
                    <div className="flex flex-wrap gap-4 mt-2">
                      {item.meta.map((m, i) => (
                        <div key={i} className="text-xs">
                          <span className="text-muted-foreground">{m.label}:</span>{" "}
                          <span>{m.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {item.actions && item.actions.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {item.actions.map((action, i) => (
                        <DropdownMenuItem
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick();
                          }}
                          className={action.destructive ? "text-destructive" : ""}
                        >
                          {action.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {showChevron && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
