"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid3X3,
  Move,
  MousePointer2,
  Hand,
  Undo,
  Redo,
  Save,
} from "lucide-react";
import type { CanvasLayoutConfig } from "./types";

/**
 * CANVAS LAYOUT
 * 
 * Freeform spatial layout for visual editing.
 * 2026 Best Practices:
 * - Pan and zoom controls
 * - Grid snapping
 * - Tool palette
 * - Keyboard shortcuts
 * - Undo/redo support
 */

export interface CanvasLayoutProps {
  config: CanvasLayoutConfig;
  loading?: boolean;
  
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  
  tool?: 'select' | 'pan' | 'move';
  onToolChange?: (tool: 'select' | 'pan' | 'move') => void;
  
  showGrid?: boolean;
  onToggleGrid?: () => void;
  
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  
  canUndo?: boolean;
  canRedo?: boolean;
  isDirty?: boolean;
  
  sidebarContent?: React.ReactNode;
  children: React.ReactNode;
}

export function CanvasLayout({
  config,
  loading = false,
  zoom = 100,
  onZoomChange,
  tool = 'select',
  onToolChange,
  showGrid = true,
  onToggleGrid,
  onUndo,
  onRedo,
  onSave,
  canUndo = false,
  canRedo = false,
  isDirty = false,
  sidebarContent,
  children,
}: CanvasLayoutProps) {
  const canvasRef = React.useRef<HTMLDivElement>(null);

  const handleZoomIn = React.useCallback(() => {
    const newZoom = Math.min(zoom + 10, config.canvas?.maxZoom || 200);
    onZoomChange?.(newZoom);
  }, [zoom, config.canvas?.maxZoom, onZoomChange]);

  const handleZoomOut = React.useCallback(() => {
    const newZoom = Math.max(zoom - 10, config.canvas?.minZoom || 25);
    onZoomChange?.(newZoom);
  }, [zoom, config.canvas?.minZoom, onZoomChange]);

  const handleFitToScreen = React.useCallback(() => {
    onZoomChange?.(100);
  }, [onZoomChange]);

  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case '=':
        case '+':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          e.preventDefault();
          handleFitToScreen();
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            onRedo?.();
          } else {
            onUndo?.();
          }
          break;
        case 's':
          e.preventDefault();
          onSave?.();
          break;
      }
    }
    
    switch (e.key) {
      case 'v':
        onToolChange?.('select');
        break;
      case 'h':
        onToolChange?.('pan');
        break;
      case 'm':
        onToolChange?.('move');
        break;
      case 'g':
        onToggleGrid?.();
        break;
    }
  }, [handleZoomIn, handleZoomOut, handleFitToScreen, onUndo, onRedo, onSave, onToolChange, onToggleGrid]);

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="border-b p-4">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="h-96 w-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">{config.title}</h1>
            
            {/* Tool Selection */}
            <div className="flex items-center border rounded-md">
              <Button
                variant={tool === 'select' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 px-2 rounded-none rounded-l-md"
                onClick={() => onToolChange?.('select')}
                title="Select (V)"
              >
                <MousePointer2 className="h-4 w-4" />
              </Button>
              <Button
                variant={tool === 'pan' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 px-2 rounded-none"
                onClick={() => onToolChange?.('pan')}
                title="Pan (H)"
              >
                <Hand className="h-4 w-4" />
              </Button>
              <Button
                variant={tool === 'move' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 px-2 rounded-none rounded-r-md"
                onClick={() => onToolChange?.('move')}
                title="Move (M)"
              >
                <Move className="h-4 w-4" />
              </Button>
            </div>

            {/* Undo/Redo */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onUndo}
                disabled={!canUndo}
                title="Undo (⌘Z)"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onRedo}
                disabled={!canRedo}
                title="Redo (⌘⇧Z)"
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Grid Toggle */}
            <Button
              variant={showGrid ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={onToggleGrid}
              title="Toggle Grid (G)"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleZoomOut}
                title="Zoom Out (⌘-)"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <div className="w-24">
                <Slider
                  value={[zoom]}
                  min={config.canvas?.minZoom || 25}
                  max={config.canvas?.maxZoom || 200}
                  step={5}
                  onValueChange={([v]) => onZoomChange?.(v)}
                />
              </div>
              <span className="text-sm w-12 text-center">{zoom}%</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleZoomIn}
                title="Zoom In (⌘+)"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleFitToScreen}
                title="Fit to Screen (⌘0)"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Save */}
            {onSave && (
              <Button size="sm" onClick={onSave} disabled={!isDirty}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        {config.sidebar?.position === 'left' && config.sidebar.enabled && sidebarContent && (
          <aside
            className="border-r bg-muted/30 flex-shrink-0 overflow-auto"
            style={{ width: config.sidebar.width || 'var(--sidebar-width-sm, 240px)' }}
          >
            <div className="p-4">{sidebarContent}</div>
          </aside>
        )}

        {/* Canvas */}
        <main
          ref={canvasRef}
          className={cn(
            "flex-1 overflow-auto relative",
            showGrid && "bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)]",
            showGrid && `bg-[size:${config.canvas?.gridSize || 20}px_${config.canvas?.gridSize || 20}px]`,
            tool === 'pan' && "cursor-grab active:cursor-grabbing"
          )}
        >
          <div
            className="min-h-full min-w-full"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
            }}
          >
            {children}
          </div>
        </main>

        {/* Right Sidebar */}
        {config.sidebar?.position === 'right' && config.sidebar.enabled && sidebarContent && (
          <aside
            className="border-l bg-muted/30 flex-shrink-0 overflow-auto"
            style={{ width: config.sidebar.width || 'var(--sidebar-width-sm, 240px)' }}
          >
            <div className="p-4">{sidebarContent}</div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default CanvasLayout;
