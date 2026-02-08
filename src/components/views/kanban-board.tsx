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
import { Card, CardContent } from "@/components/ui/card";
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
import { motion, AnimatePresence } from "framer-motion";

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
    <motion.div
      ref={setNodeRef}
      style={style}
      layoutId={item.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative group",
        isDragging && "opacity-50 z-50"
      )}
      onClick={onClick}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-3 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing z-20 transition-opacity"
      >
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </div>
      {renderCard(item)}
    </motion.div>
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
      <div className={cn("flex gap-6 overflow-x-auto pb-6 p-2", className)}>
        {localColumns.map((column) => (
          <div
            key={column.id}
            className="flex-shrink-0 w-[340px]"
          >
            <div className="flex flex-col h-full bg-muted/30 dark:bg-muted/10 rounded-2xl border border-white/5 shadow-inner p-4 space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  {column.color && (
                    <div
                      className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]"
                      style={{ backgroundColor: column.color, color: column.color }}
                    />
                  )}
                  <h3 className="text-[11px] font-black uppercase tracking-[0.15em] opacity-60">
                    {column.title}
                  </h3>
                  <Badge variant="secondary" className="bg-white/5 backdrop-blur-md border-none text-[10px] font-bold h-5 px-1.5 translate-y-[-1px]">
                    {column.items.length}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  {onAddItem && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-50 hover:opacity-100 hover:bg-white/10"
                      onClick={() => onAddItem(column.id)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {columnActions && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-50 hover:opacity-100 hover:bg-white/10">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-morphism border-white/10">
                        {columnActions(column)}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              <ScrollArea className="flex-1 -mx-2 px-2 scroll-modern">
                <SortableContext
                  items={column.items.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 pb-4 min-h-[100px]">
                    <AnimatePresence mode="popLayout">
                      {column.items.map((item) => (
                        <SortableCard
                          key={item.id}
                          item={item}
                          renderCard={renderCard}
                          onClick={() => onItemClick?.(item)}
                        />
                      ))}
                    </AnimatePresence>
                    {column.items.length === 0 && (
                      <div className="group flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/5 rounded-xl transition-colors hover:border-primary/20 hover:bg-primary/[0.02]">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <Plus className="h-4 w-4 opacity-20 group-hover:opacity-50" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-20 group-hover:opacity-40">No Items</p>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </ScrollArea>
            </div>
          </div>
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeItem && (
          <div className="rotate-3 scale-105 z-[100] cursor-grabbing transition-transform duration-200">
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
    <Card className={cn(
      "cursor-pointer overflow-hidden border-white/5 glass-morphism hover:border-primary/30 hover:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] transition-all group",
      className
    )}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm tracking-tight leading-snug group-hover:text-primary transition-colors">
                {title}
              </p>
              {subtitle && (
                <p className="text-[11px] font-medium text-muted-foreground/70 mt-1 line-clamp-2 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
            {avatar && (
              <div className="shrink-0 scale-90 group-hover:scale-100 transition-transform">
                {avatar}
              </div>
            )}
          </div>

          {badges && badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {badges.map((badge, index) => (
                <Badge
                  key={index}
                  variant={badge.variant || "secondary"}
                  className="text-[9px] font-black uppercase tracking-wider h-5 border-none bg-primary/10 text-primary-foreground/80"
                >
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}

          {footer && (
            <div className="pt-3 mt-1 border-t border-white/5 flex items-center justify-between group-hover:border-primary/10 transition-colors">
              {footer}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
