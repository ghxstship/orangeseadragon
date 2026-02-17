"use client";

/**
 * Visual Workflow Builder Canvas
 * SVG-based canvas with draggable nodes, connection drawing, zoom/pan.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { useWorkflowBuilderStore } from "@/stores/workflow-builder-store";
import { NODE_REGISTRY } from "@/lib/workflow-engine/visual-builder-types";
import type { CanvasNode, CanvasEdge, Position, CanvasNodeType } from "@/lib/workflow-engine/visual-builder-types";
import {
  Zap, Play, GitBranch, Clock, Bell, CheckCircle, Repeat,
  GitMerge, Globe, Shuffle, Code, Square, Trash2, Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ICON_MAP: Record<string, React.ElementType> = {
  Zap, Play, GitBranch, Clock, Bell, CheckCircle, Repeat,
  GitMerge, Globe, Shuffle, Code, Square,
};

const NODE_WIDTH = 200;
const NODE_HEIGHT = 72;
const HANDLE_RADIUS = 6;

// ── Canvas Node Component ────────────────────────────────────────────────

function CanvasNodeComponent({
  node,
  isSelected,
  onSelect,
  onDragStart,
  onDelete,
  onStartConnection,
}: {
  node: CanvasNode;
  isSelected: boolean;
  onSelect: () => void;
  onDragStart: (e: React.MouseEvent) => void;
  onDelete: () => void;
  onStartConnection: (handleId: string) => void;
}) {
  const reg = NODE_REGISTRY[node.type];
  const IconComp = ICON_MAP[reg?.icon || "Zap"] || Zap;
  const hasError = node.validationErrors && node.validationErrors.length > 0;

  return (
    <g
      transform={`translate(${node.position.x}, ${node.position.y})`}
      className="cursor-grab active:cursor-grabbing"
      onMouseDown={(e) => {
        e.stopPropagation();
        onSelect();
        onDragStart(e);
      }}
    >
      {/* Shadow */}
      <rect
        x={2}
        y={2}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={12}
        className="fill-black/10"
      />

      {/* Body */}
      <rect
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={12}
        className={cn(
          "fill-card stroke-2 transition-colors",
          isSelected ? "stroke-primary" : hasError ? "stroke-destructive" : "stroke-border"
        )}
      />

      {/* Icon circle */}
      <circle cx={28} cy={NODE_HEIGHT / 2} r={16} className={cn("transition-colors opacity-90", reg?.color || "fill-primary")} />
      <foreignObject x={16} y={NODE_HEIGHT / 2 - 12} width={24} height={24}>
        <IconComp className="h-5 w-5 text-white" />
      </foreignObject>

      {/* Label */}
      <foreignObject x={52} y={12} width={NODE_WIDTH - 68} height={20}>
        <p className="text-xs font-semibold text-foreground truncate leading-tight">{node.label}</p>
      </foreignObject>

      {/* Description */}
      <foreignObject x={52} y={32} width={NODE_WIDTH - 68} height={28}>
        <p className="text-[10px] text-muted-foreground truncate leading-tight">
          {node.description || node.type}
        </p>
      </foreignObject>

      {/* Input handle (top) */}
      {node.type !== "trigger" && (
        <circle
          cx={NODE_WIDTH / 2}
          cy={0}
          r={HANDLE_RADIUS}
          className="fill-muted-foreground/40 stroke-background stroke-2 hover:fill-primary cursor-crosshair transition-colors"
        />
      )}

      {/* Output handle (bottom) */}
      {node.type !== "end" && (
        <circle
          cx={NODE_WIDTH / 2}
          cy={NODE_HEIGHT}
          r={HANDLE_RADIUS}
          className="fill-muted-foreground/40 stroke-background stroke-2 hover:fill-primary cursor-crosshair transition-colors"
          onMouseDown={(e) => {
            e.stopPropagation();
            onStartConnection("output");
          }}
        />
      )}

      {/* Condition: true/false handles */}
      {node.type === "condition" && (
        <>
          <circle
            cx={0}
            cy={NODE_HEIGHT / 2}
            r={HANDLE_RADIUS}
            className="fill-destructive/60 stroke-background stroke-2 hover:fill-destructive cursor-crosshair transition-colors"
            onMouseDown={(e) => {
              e.stopPropagation();
              onStartConnection("false");
            }}
          />
          <circle
            cx={NODE_WIDTH}
            cy={NODE_HEIGHT / 2}
            r={HANDLE_RADIUS}
            className="fill-semantic-success/60 stroke-background stroke-2 hover:fill-semantic-success cursor-crosshair transition-colors"
            onMouseDown={(e) => {
              e.stopPropagation();
              onStartConnection("true");
            }}
          />
          <text x={-14} y={NODE_HEIGHT / 2 + 4} className="fill-destructive text-[8px] font-bold">F</text>
          <text x={NODE_WIDTH + 8} y={NODE_HEIGHT / 2 + 4} className="fill-semantic-success text-[8px] font-bold">T</text>
        </>
      )}

      {/* Delete button (visible on selection) */}
      {isSelected && (
        <foreignObject x={NODE_WIDTH - 24} y={-8} width={20} height={20}>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="h-5 w-5 rounded-full p-0"
          >
            <Trash2 className="h-3 w-3 text-white" />
          </Button>
        </foreignObject>
      )}
    </g>
  );
}

// ── Edge Component ───────────────────────────────────────────────────────

function EdgePath({
  edge,
  sourceNode,
  targetNode,
  isSelected,
  onSelect,
}: {
  edge: CanvasEdge;
  sourceNode: CanvasNode;
  targetNode: CanvasNode;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const getSourcePoint = (): Position => {
    if (edge.sourceHandle === "true") {
      return { x: sourceNode.position.x + NODE_WIDTH, y: sourceNode.position.y + NODE_HEIGHT / 2 };
    }
    if (edge.sourceHandle === "false") {
      return { x: sourceNode.position.x, y: sourceNode.position.y + NODE_HEIGHT / 2 };
    }
    return { x: sourceNode.position.x + NODE_WIDTH / 2, y: sourceNode.position.y + NODE_HEIGHT };
  };

  const targetPoint: Position = {
    x: targetNode.position.x + NODE_WIDTH / 2,
    y: targetNode.position.y,
  };

  const source = getSourcePoint();
  const midY = (source.y + targetPoint.y) / 2;
  const d = `M ${source.x} ${source.y} C ${source.x} ${midY}, ${targetPoint.x} ${midY}, ${targetPoint.x} ${targetPoint.y}`;

  const strokeColor =
    edge.type === "failure" || edge.type === "false"
      ? "stroke-destructive"
      : edge.type === "true" || edge.type === "success"
        ? "stroke-semantic-success"
        : "stroke-muted-foreground/50";

  return (
    <g onClick={onSelect} className="cursor-pointer">
      {/* Hit area */}
      <path d={d} fill="none" stroke="transparent" strokeWidth={12} />
      {/* Visible path */}
      <path
        d={d}
        fill="none"
        className={cn("transition-colors", isSelected ? "stroke-primary" : strokeColor)}
        strokeWidth={isSelected ? 2.5 : 2}
        strokeDasharray={edge.isAnimated ? "6 3" : undefined}
        markerEnd="url(#arrowhead)"
      />
      {/* Label */}
      {edge.label && (
        <text
          x={(source.x + targetPoint.x) / 2}
          y={(source.y + targetPoint.y) / 2 - 6}
          className="fill-muted-foreground text-[9px] font-medium"
          textAnchor="middle"
        >
          {edge.label}
        </text>
      )}
    </g>
  );
}

// ── Main Canvas ──────────────────────────────────────────────────────────

export function WorkflowCanvas() {
  const {
    nodes, edges, zoom, pan, selectedNodeId, selectedEdgeId,
    selectNode, selectEdge, clearSelection, moveNode, removeNode,
    removeEdge, addEdge, setZoom, setPan,
  } = useWorkflowBuilderStore();

  const svgRef = React.useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = React.useState<{ nodeId: string; offset: Position } | null>(null);
  const [connecting, setConnecting] = React.useState<{ sourceId: string; handle: string; mouse: Position } | null>(null);
  const [isPanning, setIsPanning] = React.useState(false);
  const [panStart, setPanStart] = React.useState<Position>({ x: 0, y: 0 });

  const toSvgCoords = React.useCallback(
    (clientX: number, clientY: number): Position => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      return {
        x: (clientX - rect.left) / zoom - pan.x,
        y: (clientY - rect.top) / zoom - pan.y,
      };
    },
    [zoom, pan]
  );

  // Mouse move handler
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragging) {
        const coords = toSvgCoords(e.clientX, e.clientY);
        moveNode(dragging.nodeId, {
          x: coords.x - dragging.offset.x,
          y: coords.y - dragging.offset.y,
        });
      }
      if (connecting) {
        const coords = toSvgCoords(e.clientX, e.clientY);
        setConnecting((prev) => prev ? { ...prev, mouse: coords } : null);
      }
      if (isPanning) {
        setPan({
          x: pan.x + (e.clientX - panStart.x) / zoom,
          y: pan.y + (e.clientY - panStart.y) / zoom,
        });
        setPanStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (connecting) {
        // Check if we're over a node's input handle
        const coords = toSvgCoords(e.clientX, e.clientY);
        const targetNode = nodes.find((n) => {
          const handleX = n.position.x + NODE_WIDTH / 2;
          const handleY = n.position.y;
          return Math.abs(coords.x - handleX) < 20 && Math.abs(coords.y - handleY) < 20;
        });

        if (targetNode && targetNode.id !== connecting.sourceId) {
          const edgeType = connecting.handle === "true" ? "true" as const
            : connecting.handle === "false" ? "false" as const
            : "default" as const;

          addEdge({
            source: connecting.sourceId,
            target: targetNode.id,
            sourceHandle: connecting.handle,
            type: edgeType,
            label: connecting.handle === "true" ? "Yes" : connecting.handle === "false" ? "No" : undefined,
          });
        }
        setConnecting(null);
      }
      setDragging(null);
      setIsPanning(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, connecting, isPanning, nodes, zoom, pan, panStart, toSvgCoords, moveNode, setPan, addEdge]);

  // Wheel zoom
  const handleWheel = React.useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setZoom(zoom + delta);
    },
    [zoom, setZoom]
  );

  // Background click = clear selection
  const handleBackgroundClick = React.useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  // Background drag = pan
  const handleBackgroundMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      if (e.target === svgRef.current || (e.target as SVGElement).tagName === "rect") {
        setIsPanning(true);
        setPanStart({ x: e.clientX, y: e.clientY });
      }
    },
    []
  );

  // Drop handler for palette items
  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const data = e.dataTransfer.getData("application/workflow-node");
      if (!data) return;

      try {
        const { type, label, config } = JSON.parse(data) as { type: CanvasNodeType; label: string; config: Record<string, unknown> };
        const coords = toSvgCoords(e.clientX, e.clientY);
        const { addNode } = useWorkflowBuilderStore.getState();
        const nodeId = addNode(type, { x: coords.x - NODE_WIDTH / 2, y: coords.y - NODE_HEIGHT / 2 }, config);
        const store = useWorkflowBuilderStore.getState();
        store.updateNode(nodeId, { label, description: label });
      } catch {
        // Invalid drop data
      }
    },
    [toSvgCoords]
  );

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const nodeMap = React.useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  return (
    <div
      className="relative flex-1 overflow-hidden bg-muted/20 rounded-lg border border-border"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-card/80 backdrop-blur-sm rounded-lg border border-border p-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(zoom - 0.1)}>
          <span className="text-xs font-bold">−</span>
        </Button>
        <span className="text-[10px] font-mono w-10 text-center">{Math.round(zoom * 100)}%</span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(zoom + 0.1)}>
          <Plus className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>
          <span className="text-[10px]">1:1</span>
        </Button>
      </div>

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <GitBranch className="h-8 w-8 text-primary/50" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Drag nodes from the palette to start building</p>
            <p className="text-xs text-muted-foreground/60">Connect nodes by dragging from output to input handles</p>
          </div>
        </div>
      )}

      <svg
        ref={svgRef}
        className="w-full h-full min-h-[600px]"
        onWheel={handleWheel}
        onClick={handleBackgroundClick}
        onMouseDown={handleBackgroundMouseDown}
      >
        <defs>
          {/* Grid pattern */}
          <pattern id="grid" width={20} height={20} patternUnits="userSpaceOnUse">
            <circle cx={1} cy={1} r={0.5} className="fill-muted-foreground/10" />
          </pattern>
          {/* Arrowhead */}
          <marker id="arrowhead" markerWidth={8} markerHeight={6} refX={8} refY={3} orient="auto">
            <polygon points="0 0, 8 3, 0 6" className="fill-muted-foreground/50" />
          </marker>
        </defs>

        <g transform={`scale(${zoom}) translate(${pan.x}, ${pan.y})`}>
          {/* Grid */}
          <rect x={-5000} y={-5000} width={10000} height={10000} fill="url(#grid)" />

          {/* Edges */}
          {edges.map((edge) => {
            const sourceNode = nodeMap.get(edge.source);
            const targetNode = nodeMap.get(edge.target);
            if (!sourceNode || !targetNode) return null;
            return (
              <EdgePath
                key={edge.id}
                edge={edge}
                sourceNode={sourceNode}
                targetNode={targetNode}
                isSelected={selectedEdgeId === edge.id}
                onSelect={() => selectEdge(edge.id)}
              />
            );
          })}

          {/* Connection preview line */}
          {connecting && (() => {
            const sourceNode = nodeMap.get(connecting.sourceId);
            if (!sourceNode) return null;
            let sx: number, sy: number;
            if (connecting.handle === "true") {
              sx = sourceNode.position.x + NODE_WIDTH;
              sy = sourceNode.position.y + NODE_HEIGHT / 2;
            } else if (connecting.handle === "false") {
              sx = sourceNode.position.x;
              sy = sourceNode.position.y + NODE_HEIGHT / 2;
            } else {
              sx = sourceNode.position.x + NODE_WIDTH / 2;
              sy = sourceNode.position.y + NODE_HEIGHT;
            }
            return (
              <line
                x1={sx}
                y1={sy}
                x2={connecting.mouse.x}
                y2={connecting.mouse.y}
                className="stroke-primary"
                strokeWidth={2}
                strokeDasharray="6 3"
              />
            );
          })()}

          {/* Nodes */}
          {nodes.map((node) => (
            <CanvasNodeComponent
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              onSelect={() => selectNode(node.id)}
              onDragStart={(e) => {
                const coords = toSvgCoords(e.clientX, e.clientY);
                setDragging({
                  nodeId: node.id,
                  offset: {
                    x: coords.x - node.position.x,
                    y: coords.y - node.position.y,
                  },
                });
              }}
              onDelete={() => removeNode(node.id)}
              onStartConnection={(handle) => {
                const coords = toSvgCoords(0, 0);
                setConnecting({ sourceId: node.id, handle, mouse: coords });
              }}
            />
          ))}
        </g>
      </svg>

      {/* Selected edge delete */}
      {selectedEdgeId && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => removeEdge(selectedEdgeId)}
            className="gap-1.5 shadow-lg"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Connection
          </Button>
        </div>
      )}
    </div>
  );
}
