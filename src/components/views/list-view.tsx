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
import { motion, AnimatePresence } from "framer-motion";

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
    <Card className={cn("border-border glass-morphism overflow-hidden shadow-2xl", className)}>
      {title && (
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border bg-background/5">
          <CardTitle className="text-xl font-black tracking-tight uppercase opacity-80">{title}</CardTitle>
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
        <div className="divide-y divide-border">
          <AnimatePresence mode="popLayout">
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
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)", x: 4 }}
                  className={cn(
                    "flex items-center gap-4 p-5 transition-all duration-300 border-b border-border last:border-b-0",
                    onItemClick && "cursor-pointer",
                    isSelected && "bg-primary/10 shadow-[inner_0_0_20px_rgba(var(--primary),0.05)]"
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
                      <span className="text-sm font-black tracking-tight group-hover:text-primary transition-colors">{item.title}</span>
                      {item.badge && (
                        <Badge variant={item.badge.variant || "secondary"} className="bg-muted border-border text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
                          {item.badge.label}
                        </Badge>
                      )}
                      {item.status && (
                        <div className="flex items-center gap-1.5 bg-muted px-2 py-0.5 rounded-full border border-border">
                          <div
                            className="h-1.5 w-1.5 rounded-full shadow-lg"
                            style={{ "--status-indicator": item.status.color || "hsl(var(--muted-foreground))", backgroundColor: "var(--status-indicator)" } as React.CSSProperties}
                          />
                          <span className="text-[10px] font-bold uppercase tracking-tight opacity-60">
                            {item.status.label}
                          </span>
                        </div>
                      )}
                    </div>
                    {item.subtitle && (
                      <p className="text-[11px] font-bold text-muted-foreground truncate opacity-40 mt-0.5">
                        {item.subtitle}
                      </p>
                    )}
                    {item.description && (
                      <p className="text-[11px] font-medium text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                    {item.meta && item.meta.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-3">
                        {item.meta.map((m, i) => (
                          <div key={i} className="text-[9px] font-black uppercase tracking-widest bg-muted px-2 py-0.5 rounded border border-border">
                            <span className="opacity-30">{m.label}:</span>{" "}
                            <span className="opacity-80">{m.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {item.actions && item.actions.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-morphism border-border">
                        {item.actions.map((action, i) => (
                          <DropdownMenuItem
                            key={i}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick();
                            }}
                            className={cn("text-[10px] font-bold uppercase tracking-wider", action.destructive ? "text-destructive/80 focus:text-destructive/80" : "")}
                          >
                            {action.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {showChevron && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
