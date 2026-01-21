"use client";

import * as React from "react";
import { PageHeader } from "./page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Plus, MoreHorizontal, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BoardPageConfig } from "@/config/pages/board-types";

export interface BoardPageProps<T extends object> {
  config: BoardPageConfig;
  data: T[];
  getRowId: (item: T) => string;
  onAction?: (actionId: string, payload?: unknown) => void;
  onCardMove?: (cardId: string, fromColumn: string, toColumn: string) => void;
  loading?: boolean;
}

function BoardCard<T extends object>({
  item,
  config,
  getRowId,
  onAction,
}: {
  item: T;
  config: BoardPageConfig;
  getRowId: (item: T) => string;
  onAction?: (actionId: string, payload?: unknown) => void;
}) {
  const record = item as Record<string, unknown>;
  const cardConfig = config.card;

  const priorityColors: Record<string, string> = {
    urgent: "bg-red-500",
    high: "bg-orange-500",
    medium: "bg-yellow-500",
    low: "bg-blue-500",
    none: "bg-gray-300",
  };

  const priority = cardConfig.priorityField ? String(record[cardConfig.priorityField] ?? "none").toLowerCase() : null;

  return (
    <div className="rounded-lg border bg-card p-3 hover:bg-accent/50 cursor-pointer group">
      <div className="flex items-start gap-2">
        {config.actions?.dragDrop?.enabled && (
          <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab shrink-0 mt-0.5" />
        )}
        {priority && (
          <div className={cn("mt-1.5 h-2 w-2 rounded-full shrink-0", priorityColors[priority] ?? priorityColors.none)} />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {String(record[cardConfig.titleField] ?? "")}
          </p>
          {cardConfig.subtitleField && record[cardConfig.subtitleField] ? (
            <p className="text-xs text-muted-foreground truncate">
              {String(record[cardConfig.subtitleField])}
            </p>
          ) : null}
          {cardConfig.metaFields && cardConfig.metaFields.length > 0 && (
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              {cardConfig.metaFields.map((field) => (
                record[field] ? <span key={field}>{String(record[field])}</span> : null
              ))}
            </div>
          )}
        </div>
        {config.cardActions && config.cardActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {config.cardActions.map((action) => (
                <DropdownMenuItem
                  key={action.id}
                  onClick={() => onAction?.(action.id, { item, id: getRowId(item) })}
                  className={action.variant === "destructive" ? "text-destructive" : undefined}
                >
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

function BoardColumn<T extends object>({
  column,
  items,
  config,
  getRowId,
  onAction,
}: {
  column: { id: string; title: string; statusValue: string; color?: string; limit?: number };
  items: T[];
  config: BoardPageConfig;
  getRowId: (item: T) => string;
  onAction?: (actionId: string, payload?: unknown) => void;
}) {
  const isOverLimit = column.limit !== undefined && items.length > column.limit;

  return (
    <Card className="flex flex-col min-h-[400px]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          {column.color && (
            <div className={cn("h-3 w-3 rounded-full")} style={{ backgroundColor: column.color }} />
          )}
          {column.title}
          <Badge variant={isOverLimit ? "destructive" : "secondary"} className="ml-auto">
            {items.length}{column.limit !== undefined && `/${column.limit}`}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-2 overflow-y-auto">
        {items.map((item) => (
          <BoardCard
            key={getRowId(item)}
            item={item}
            config={config}
            getRowId={getRowId}
            onAction={onAction}
          />
        ))}
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No items
          </p>
        )}
        {config.actions?.quickAdd?.enabled && (
          config.actions.quickAdd.columns === undefined ||
          config.actions.quickAdd.columns.includes(column.id)
        ) && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
            onClick={() => onAction?.("quick-add", { column: column.statusValue })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add item
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function BoardPage<T extends object>({
  config,
  data,
  getRowId,
  onAction,
}: BoardPageProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredData = React.useMemo(() => {
    if (!searchQuery) return data;
    const query = searchQuery.toLowerCase();
    const searchFields = config.toolbar?.search?.fields ?? [config.card.titleField];
    return data.filter((item) => {
      const record = item as Record<string, unknown>;
      return searchFields.some((field) =>
        String(record[field] ?? "").toLowerCase().includes(query)
      );
    });
  }, [data, searchQuery, config.toolbar?.search?.fields, config.card.titleField]);

  const groupedData = React.useMemo(() => {
    const groups: Record<string, T[]> = {};
    config.columns.forEach((col) => {
      groups[col.statusValue] = [];
    });
    filteredData.forEach((item) => {
      const record = item as Record<string, unknown>;
      const status = String(record[config.statusField] ?? "");
      if (groups[status]) {
        groups[status].push(item);
      }
    });
    return groups;
  }, [filteredData, config.columns, config.statusField]);

  const handlePrimaryAction = React.useCallback(() => {
    if (config.primaryAction) {
      onAction?.(config.primaryAction.id);
    }
  }, [config.primaryAction, onAction]);

  const primaryActionButton = config.primaryAction ? (
    <Button onClick={handlePrimaryAction}>
      <Plus className="mr-2 h-4 w-4" />
      {config.primaryAction.label}
    </Button>
  ) : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title={config.title}
        description={config.description}
        actions={primaryActionButton}
      />

      {config.toolbar?.search?.enabled && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={config.toolbar.search.placeholder ?? "Search..."}
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className={cn(
        "grid gap-4",
        config.columns.length <= 4 ? `grid-cols-1 md:grid-cols-2 lg:grid-cols-${config.columns.length}` :
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6"
      )}>
        {config.columns.map((column) => (
          <BoardColumn
            key={column.id}
            column={column}
            items={groupedData[column.statusValue] ?? []}
            config={config}
            getRowId={getRowId}
            onAction={onAction}
          />
        ))}
      </div>
    </div>
  );
}
