"use client";

import * as React from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { GripVertical, MoreHorizontal, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface KanbanColumn<T> {
  id: string;
  title: string;
  color?: string;
  limit?: number;
  items: T[];
}

export interface KanbanBoardProps<T extends { id: string }> {
  columns: KanbanColumn<T>[];
  onColumnChange?: (columns: KanbanColumn<T>[]) => void;
  onItemMove?: (itemId: string, fromColumn: string, toColumn: string, newIndex: number) => void;
  onItemClick?: (item: T) => void;
  onAddItem?: (columnId: string) => void;
  renderCard: (item: T) => React.ReactNode;
  renderCardOverlay?: (item: T) => React.ReactNode;
  columnActions?: (column: KanbanColumn<T>) => React.ReactNode;
  className?: string;
}

interface SortableCardProps<T extends { id: string }> {
  item: T;
  renderCard: (item: T) => React.ReactNode;
  onClick?: () => void;
}

function SortableCard<T extends { id: string }>({
  item,
  renderCard,
  onClick,
}: SortableCardProps<T>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        isDragging && "opacity-50"
      )}
      onClick={onClick}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing z-10"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      {renderCard(item)}
    </div>
  );
}

export function KanbanBoard<T extends { id: string }>({
  columns,
  onColumnChange,
  onItemMove,
  onItemClick,
  onAddItem,
  renderCard,
  renderCardOverlay,
  columnActions,
  className,
}: KanbanBoardProps<T>) {
  const [activeItem, setActiveItem] = React.useState<T | null>(null);
  const [localColumns, setLocalColumns] = React.useState(columns);

  React.useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const findColumn = (id: string) => {
    return localColumns.find((col) =>
      col.items.some((item) => item.id === id)
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const column = findColumn(active.id as string);
    if (column) {
      const item = column.items.find((i) => i.id === active.id);
      if (item) {
        setActiveItem(item);
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumn(activeId);
    const overColumn = localColumns.find(
      (col) => col.id === overId || col.items.some((item) => item.id === overId)
    );

    if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) {
      return;
    }

    setLocalColumns((prev) => {
      const activeItems = [...activeColumn.items];
      const overItems = [...overColumn.items];

      const activeIndex = activeItems.findIndex((item) => item.id === activeId);
      const overIndex = overItems.findIndex((item) => item.id === overId);

      const [movedItem] = activeItems.splice(activeIndex, 1);
      
      if (overIndex === -1) {
        overItems.push(movedItem);
      } else {
        overItems.splice(overIndex, 0, movedItem);
      }

      return prev.map((col) => {
        if (col.id === activeColumn.id) {
          return { ...col, items: activeItems };
        }
        if (col.id === overColumn.id) {
          return { ...col, items: overItems };
        }
        return col;
      });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumn(activeId);
    const overColumn = localColumns.find(
      (col) => col.id === overId || col.items.some((item) => item.id === overId)
    );

    if (!activeColumn || !overColumn) return;

    if (activeColumn.id === overColumn.id) {
      const items = [...activeColumn.items];
      const activeIndex = items.findIndex((item) => item.id === activeId);
      const overIndex = items.findIndex((item) => item.id === overId);

      if (activeIndex !== overIndex) {
        const newItems = arrayMove(items, activeIndex, overIndex);
        const newColumns = localColumns.map((col) =>
          col.id === activeColumn.id ? { ...col, items: newItems } : col
        );
        setLocalColumns(newColumns);
        onColumnChange?.(newColumns);
      }
    } else {
      const overIndex = overColumn.items.findIndex((item) => item.id === overId);
      const newIndex = overIndex === -1 ? overColumn.items.length : overIndex;
      
      onItemMove?.(activeId, activeColumn.id, overColumn.id, newIndex);
      onColumnChange?.(localColumns);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={cn("flex gap-4 overflow-x-auto pb-4", className)}>
        {localColumns.map((column) => (
          <div
            key={column.id}
            className="flex-shrink-0 w-[320px]"
          >
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {column.color && (
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: column.color }}
                      />
                    )}
                    <CardTitle className="text-sm font-medium">
                      {column.title}
                    </CardTitle>
                    <Badge variant="secondary" className="ml-1">
                      {column.items.length}
                      {column.limit && `/${column.limit}`}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    {onAddItem && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onAddItem(column.id)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                    {columnActions && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {columnActions(column)}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-[calc(100vh-280px)]">
                  <SortableContext
                    items={column.items.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2 pr-4">
                      {column.items.map((item) => (
                        <SortableCard
                          key={item.id}
                          item={item}
                          renderCard={renderCard}
                          onClick={() => onItemClick?.(item)}
                        />
                      ))}
                      {column.items.length === 0 && (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                          No items
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeItem && (
          <div className="opacity-80">
            {renderCardOverlay ? renderCardOverlay(activeItem) : renderCard(activeItem)}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

export interface KanbanCardProps {
  title: string;
  subtitle?: string;
  badges?: Array<{ label: string; variant?: "default" | "secondary" | "destructive" | "outline" }>;
  avatar?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function KanbanCard({
  title,
  subtitle,
  badges,
  avatar,
  footer,
  className,
}: KanbanCardProps) {
  return (
    <Card className={cn("cursor-pointer hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{title}</p>
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
              )}
            </div>
            {avatar}
          </div>
          {badges && badges.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {badges.map((badge, index) => (
                <Badge key={index} variant={badge.variant || "secondary"} className="text-xs">
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}
          {footer && <div className="pt-2 border-t">{footer}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
