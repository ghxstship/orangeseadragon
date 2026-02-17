"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  GripVertical,
  Settings,
  Trash2,
  Plus,
  LayoutGrid,
  Save,
  Maximize2,
  Minimize2,
  MoreVertical,
} from "lucide-react";
import {
  DashboardLayout,
  DashboardWidget,
  WidgetDefinition,
  WidgetSize,
  getWidgetDefinition,
  widgetRegistry,
} from "@/lib/dashboard/widget-registry";

// Dynamic widget imports
import { MetricsWidget } from "@/components/widgets/MetricsWidget";
import { QuickStatsWidget } from "@/components/widgets/QuickStatsWidget";
import { TodayScheduleWidget } from "@/components/widgets/TodayScheduleWidget";
import { UpcomingTasksWidget } from "@/components/widgets/UpcomingTasksWidget";
import { MyTasksWidget } from "@/components/widgets/MyTasksWidget";
import { QuickActionsWidget } from "@/components/widgets/QuickActionsWidget";
import { RecentActivityWidget } from "@/components/widgets/RecentActivityWidget";
import { ActiveEventsWidget } from "@/components/widgets/ActiveEventsWidget";
import { CrewStatusWidget } from "@/components/widgets/CrewStatusWidget";
import { InboxSummaryWidget } from "@/components/widgets/InboxSummaryWidget";
import { ProjectProgressWidget } from "@/components/widgets/ProjectProgressWidget";
import { SetupChecklistWidget } from "@/components/widgets/SetupChecklistWidget";

// Widget component map
const widgetComponents: Record<string, React.ComponentType<Record<string, unknown>>> = {
  MetricsWidget,
  QuickStatsWidget,
  TodayScheduleWidget,
  UpcomingTasksWidget,
  MyTasksWidget,
  QuickActionsWidget,
  RecentActivityWidget,
  ActiveEventsWidget,
  CrewStatusWidget,
  InboxSummaryWidget,
  ProjectProgressWidget,
  SetupChecklistWidget,
};

interface DashboardGridProps {
  layout: DashboardLayout;
  onLayoutChange?: (layout: DashboardLayout) => void;
  isEditing?: boolean;
  onEditToggle?: () => void;
  className?: string;
}

const widgetSizeClasses: Record<WidgetSize, string> = {
  small: "col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-3 row-span-1",
  medium: "col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-6 xl:col-span-6 row-span-1",
  large: "col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-6 xl:col-span-6 row-span-2",
  full: "col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-6 xl:col-span-12 row-span-1",
};

export function DashboardGrid({
  layout,
  onLayoutChange,
  isEditing = false,
  onEditToggle,
  className,
}: DashboardGridProps) {
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [editingWidget, setEditingWidget] = useState<DashboardWidget | null>(null);

  const handleDragStart = useCallback((widgetId: string) => {
    setDraggedWidget(widgetId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedWidget(null);
  }, []);

  const handleDrop = useCallback(
    (targetPosition: { x: number; y: number }) => {
      if (!draggedWidget || !onLayoutChange) return;

      const updatedWidgets = layout.widgets.map((w) =>
        w.id === draggedWidget ? { ...w, position: targetPosition } : w
      );

      onLayoutChange({ ...layout, widgets: updatedWidgets });
      setDraggedWidget(null);
    },
    [draggedWidget, layout, onLayoutChange]
  );

  const handleRemoveWidget = useCallback(
    (widgetId: string) => {
      if (!onLayoutChange) return;
      const updatedWidgets = layout.widgets.filter((w) => w.id !== widgetId);
      onLayoutChange({ ...layout, widgets: updatedWidgets });
    },
    [layout, onLayoutChange]
  );

  const handleResizeWidget = useCallback(
    (widgetId: string, newSize: WidgetSize) => {
      if (!onLayoutChange) return;
      const updatedWidgets = layout.widgets.map((w) =>
        w.id === widgetId ? { ...w, size: newSize } : w
      );
      onLayoutChange({ ...layout, widgets: updatedWidgets });
    },
    [layout, onLayoutChange]
  );

  const handleAddWidget = useCallback(
    (definition: WidgetDefinition) => {
      if (!onLayoutChange) return;

      // Find next available position
      const maxY = Math.max(...layout.widgets.map((w) => w.position.y), -1);
      const newWidget: DashboardWidget = {
        id: `w${Date.now()}`,
        widgetId: definition.id,
        position: { x: 0, y: maxY + 1 },
        size: definition.defaultSize,
        config: definition.defaultConfig,
      };

      onLayoutChange({ ...layout, widgets: [...layout.widgets, newWidget] });
      setShowAddWidget(false);
    },
    [layout, onLayoutChange]
  );

  const handleUpdateWidgetConfig = useCallback(
    (widgetId: string, config: Record<string, unknown>) => {
      if (!onLayoutChange) return;
      const updatedWidgets = layout.widgets.map((w) =>
        w.id === widgetId ? { ...w, config: { ...w.config, ...config } } : w
      );
      onLayoutChange({ ...layout, widgets: updatedWidgets });
      setEditingWidget(null);
    },
    [layout, onLayoutChange]
  );

  const renderWidget = (widget: DashboardWidget) => {
    const definition = getWidgetDefinition(widget.widgetId);
    if (!definition) return null;

    const Component = widgetComponents[definition.component];
    if (!Component) {
      return (
        <Card className="h-full">
          <CardContent className="flex items-center justify-center h-full text-muted-foreground">
            Widget not found: {definition.component}
          </CardContent>
        </Card>
      );
    }

    return (
      <div
        key={widget.id}
        className={cn(
          "relative group",
          widgetSizeClasses[widget.size],
          isEditing && "ring-2 ring-dashed ring-primary/30 rounded-lg",
          draggedWidget === widget.id && "opacity-50"
        )}
        draggable={isEditing}
        onDragStart={() => handleDragStart(widget.id)}
        onDragEnd={handleDragEnd}
      >
        {isEditing && (
          <div className="absolute -top-2 -right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="secondary" className="h-6 w-6">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditingWidget(widget)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configure
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleResizeWidget(widget.id, "small")}
                  disabled={widget.size === "small"}
                >
                  <Minimize2 className="mr-2 h-4 w-4" />
                  Small
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleResizeWidget(widget.id, "medium")}
                  disabled={widget.size === "medium"}
                >
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Medium
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleResizeWidget(widget.id, "large")}
                  disabled={widget.size === "large"}
                >
                  <Maximize2 className="mr-2 h-4 w-4" />
                  Large
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleRemoveWidget(widget.id)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="icon"
              variant="secondary"
              className="h-6 w-6 cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-3 w-3" />
            </Button>
          </div>
        )}
        <Component {...(widget.config || {})} />
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      {onEditToggle && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isEditing && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddWidget(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Widget
                </Button>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isEditing && (
              <Badge variant="secondary" className="text-xs">
                Editing Mode
              </Badge>
            )}
            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              onClick={onEditToggle}
            >
              {isEditing ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Layout
                </>
              ) : (
                <>
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Customize
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12"
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => handleDrop({ x: 0, y: 0 })}
      >
        {layout.widgets.map(renderWidget)}
      </div>

      {/* Add Widget Dialog */}
      <Dialog open={showAddWidget} onOpenChange={setShowAddWidget}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Widget</DialogTitle>
            <DialogDescription>
              Choose a widget to add to your dashboard
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 max-h-[400px] overflow-y-auto">
            {widgetRegistry.map((definition) => {
              const isAdded = layout.widgets.some(
                (w) => w.widgetId === definition.id
              );
              return (
                <Card
                  key={definition.id}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-accent",
                    isAdded && "opacity-50"
                  )}
                  onClick={() => !isAdded && handleAddWidget(definition)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{definition.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {definition.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {definition.description}
                    </p>
                    {isAdded && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        Already added
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Widget Config Dialog */}
      {editingWidget && (
        <WidgetConfigDialog
          widget={editingWidget}
          onClose={() => setEditingWidget(null)}
          onSave={(config) => handleUpdateWidgetConfig(editingWidget.id, config)}
        />
      )}
    </div>
  );
}

interface WidgetConfigDialogProps {
  widget: DashboardWidget;
  onClose: () => void;
  onSave: (config: Record<string, unknown>) => void;
}

function WidgetConfigDialog({ widget, onClose, onSave }: WidgetConfigDialogProps) {
  const definition = getWidgetDefinition(widget.widgetId);
  const [config, setConfig] = useState<Record<string, unknown>>(widget.config || {});

  if (!definition?.configSchema) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure {definition?.name}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            This widget has no configurable options.
          </p>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure {definition.name}</DialogTitle>
          <DialogDescription>{definition.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {definition.configSchema.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              {field.type === "text" && (
                <Input
                  id={field.key}
                  value={(config[field.key] as string) || ""}
                  onChange={(e) =>
                    setConfig({ ...config, [field.key]: e.target.value })
                  }
                />
              )}
              {field.type === "number" && (
                <Input
                  id={field.key}
                  type="number"
                  value={String((config[field.key] as number) ?? field.default ?? 0)}
                  onChange={(e) =>
                    setConfig({ ...config, [field.key]: parseInt(e.target.value, 10) })
                  }
                />
              )}
              {field.type === "boolean" && (
                <div className="flex items-center gap-2">
                  <Switch
                    id={field.key}
                    checked={(config[field.key] as boolean) || false}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, [field.key]: checked })
                    }
                  />
                  <Label htmlFor={field.key} className="text-sm font-normal">
                    Enable
                  </Label>
                </div>
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(config)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Loading skeleton for dashboard
export function DashboardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
      <Skeleton className="h-24 sm:col-span-2 lg:col-span-12" />
      <Skeleton className="h-48 lg:col-span-6" />
      <Skeleton className="h-48 lg:col-span-6" />
      <Skeleton className="h-32 lg:col-span-4" />
      <Skeleton className="h-32 lg:col-span-8" />
    </div>
  );
}
