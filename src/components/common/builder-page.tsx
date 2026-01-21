"use client";

import * as React from "react";
import { PageHeader } from "./page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Save,
  Play,
  Undo,
  Redo,
  Settings,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BuilderPageConfig, ToolConfig, SchemaItemConfig } from "@/config/pages/builder-types";

export interface BuilderPageProps {
  config: BuilderPageConfig;
  initialValue?: unknown;
  onSave?: (value: unknown) => void;
  onRun?: () => void;
  onExport?: (format: string) => void;
  loading?: boolean;
}

function ToolPalette({ tools, onSelect }: { tools: ToolConfig[]; onSelect?: (tool: ToolConfig) => void }) {
  const groupedTools = tools.reduce((acc, tool) => {
    const category = tool.category ?? "General";
    if (!acc[category]) acc[category] = [];
    acc[category].push(tool);
    return acc;
  }, {} as Record<string, ToolConfig[]>);

  return (
    <div className="space-y-4">
      {Object.entries(groupedTools).map(([category, categoryTools]) => (
        <div key={category}>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">{category}</h4>
          <div className="space-y-1">
            {categoryTools.map((tool) => (
              <div
                key={tool.id}
                className="flex items-center gap-2 p-2 rounded-md border cursor-pointer hover:bg-accent"
                draggable
                onClick={() => onSelect?.(tool)}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{tool.label}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SchemaTree({ items, level = 0 }: { items: SchemaItemConfig[]; level?: number }) {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-1">
      {items.map((item) => (
        <div key={item.id}>
          <div
            className={cn(
              "flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer text-sm",
              level > 0 && "ml-4"
            )}
            onClick={() => item.children && toggleExpand(item.id)}
          >
            {item.children && (
              <span className="text-xs">{expanded.has(item.id) ? "▼" : "▶"}</span>
            )}
            <span className="font-mono">{item.label}</span>
            <span className="text-xs text-muted-foreground">{item.type}</span>
          </div>
          {item.children && expanded.has(item.id) && (
            <SchemaTree items={item.children} level={level + 1} />
          )}
        </div>
      ))}
    </div>
  );
}

function BuilderCanvas({ config }: { config: BuilderPageConfig }) {
  const [zoom, setZoom] = React.useState(100);

  return (
    <div className="flex-1 flex flex-col">
      {config.canvas.zoomEnabled && (
        <div className="flex items-center gap-2 p-2 border-b">
          <Button variant="ghost" size="icon" onClick={() => setZoom((z) => Math.max(25, z - 25))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm w-12 text-center">{zoom}%</span>
          <Button variant="ghost" size="icon" onClick={() => setZoom((z) => Math.min(200, z + 25))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div
        className={cn(
          "flex-1 p-4 overflow-auto",
          config.canvas.gridEnabled && "bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:20px_20px]"
        )}
        style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}
      >
        <div className="border-2 border-dashed rounded-lg p-8 text-center min-h-[400px] flex flex-col items-center justify-center bg-background">
          <p className="text-muted-foreground mb-4">
            {config.builderType === "report" && "Drag data sources and chart types here to build your report"}
            {config.builderType === "workflow" && "Drag workflow steps here to build your automation"}
            {config.builderType === "query" && "Build your query using the schema browser"}
            {config.builderType === "form" && "Drag form fields here to build your form"}
            {config.builderType === "dashboard" && "Drag widgets here to build your dashboard"}
          </p>
        </div>
      </div>
    </div>
  );
}

export function BuilderPage({
  config,
  onSave,
  onRun,
  onExport,
  loading = false,
}: BuilderPageProps) {
  const [name, setName] = React.useState("Untitled");
  const [canUndo, setCanUndo] = React.useState(false);
  const [canRedo, setCanRedo] = React.useState(false);

  const toolbarActions = (
    <div className="flex items-center gap-2">
      {config.toolbar?.undo && (
        <Button variant="ghost" size="icon" disabled={!canUndo}>
          <Undo className="h-4 w-4" />
        </Button>
      )}
      {config.toolbar?.redo && (
        <Button variant="ghost" size="icon" disabled={!canRedo}>
          <Redo className="h-4 w-4" />
        </Button>
      )}
      {config.toolbar?.settings && (
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      )}
      {config.actions?.preview && (
        <Button variant="outline" onClick={onRun} disabled={loading}>
          <Play className="mr-2 h-4 w-4" />
          {config.actions.preview.label ?? "Preview"}
        </Button>
      )}
      {config.actions?.run && (
        <Button variant="outline" onClick={onRun} disabled={loading}>
          <Play className="mr-2 h-4 w-4" />
          {config.actions.run.label ?? "Run"}
        </Button>
      )}
      {config.actions?.export && (
        <Button variant="outline" onClick={() => onExport?.("json")} disabled={loading}>
          <Download className="mr-2 h-4 w-4" />
          {config.actions.export.label ?? "Export"}
        </Button>
      )}
      {config.actions?.save && (
        <Button onClick={() => onSave?.({})} disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Saving..." : config.actions.save.label ?? "Save"}
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-4 h-full flex flex-col">
      <PageHeader
        title={config.title}
        description={config.description}
        actions={toolbarActions}
      />

      <div className="flex-1 flex gap-4 min-h-0">
        {config.sidebar && (
          <Card className="w-64 shrink-0 overflow-hidden flex flex-col">
            <CardHeader className="pb-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="font-medium"
                placeholder="Name..."
              />
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              {config.sidebar.tools && config.sidebar.tools.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Tools</h3>
                  <ToolPalette tools={config.sidebar.tools} />
                </div>
              )}
              {config.sidebar.schema && config.sidebar.schema.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Schema</h3>
                  <SchemaTree items={config.sidebar.schema} />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="flex-1 overflow-hidden flex flex-col">
          <BuilderCanvas config={config} />
        </Card>

        {config.properties?.enabled && config.properties.position === "right" && (
          <Card className="w-64 shrink-0">
            <CardHeader>
              <CardTitle className="text-sm">Properties</CardTitle>
              <CardDescription>Select an element to edit</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-4">
                No element selected
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
