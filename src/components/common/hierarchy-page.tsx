"use client";

import * as React from "react";
import { PageHeader } from "./page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ChevronRight,
  ChevronDown,
  Expand,
  Shrink,
  Download,
  Maximize,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { HierarchyPageConfig } from "@/config/pages/hierarchy-types";

export interface HierarchyPageProps<T extends object> {
  config: HierarchyPageConfig;
  data: T[];
  getNodeId: (node: T) => string;
  onAction?: (actionId: string, payload?: unknown) => void;
  onNodeClick?: (node: T) => void;
  loading?: boolean;
}

interface TreeNode<T> {
  data: T;
  children: TreeNode<T>[];
}

function buildTree<T extends object>(
  items: T[],
  idField: string,
  parentField: string
): TreeNode<T>[] {
  const itemMap = new Map<string, TreeNode<T>>();
  const roots: TreeNode<T>[] = [];

  items.forEach((item) => {
    const record = item as Record<string, unknown>;
    const id = String(record[idField] ?? "");
    itemMap.set(id, { data: item, children: [] });
  });

  items.forEach((item) => {
    const record = item as Record<string, unknown>;
    const id = String(record[idField] ?? "");
    const parentId = String(record[parentField] ?? "");
    const node = itemMap.get(id)!;

    if (parentId && itemMap.has(parentId)) {
      itemMap.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

function TreeNodeComponent<T extends object>({
  node,
  config,
  level,
  expanded,
  onToggle,
  onNodeClick,
}: {
  node: TreeNode<T>;
  config: HierarchyPageConfig;
  level: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onNodeClick?: (node: T) => void;
}) {
  const record = node.data as Record<string, unknown>;
  const id = String(record[config.node.idField] ?? "");
  const label = String(record[config.node.labelField] ?? "");
  const subtitle = config.node.subtitleField ? String(record[config.node.subtitleField] ?? "") : undefined;
  const avatar = config.node.avatarField ? String(record[config.node.avatarField] ?? "") : undefined;
  const badge = config.node.badgeField ? String(record[config.node.badgeField] ?? "") : undefined;
  const hasChildren = node.children.length > 0;
  const isExpanded = expanded.has(id);
  const indent = config.tree?.indent ?? 24;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer",
          config.tree?.showLines && level > 0 && "border-l-2 border-muted"
        )}
        style={{ marginLeft: level * indent }}
        onClick={() => onNodeClick?.(node.data)}
      >
        {hasChildren ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(id);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <div className="w-6" />
        )}

        {avatar && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatar} />
            <AvatarFallback>{label.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{label}</span>
            {badge && <Badge variant="secondary">{badge}</Badge>}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>

        <span className="text-xs text-muted-foreground">
          {hasChildren && `${node.children.length} items`}
        </span>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => {
            const childRecord = child.data as Record<string, unknown>;
            const childId = String(childRecord[config.node.idField] ?? "");
            return (
              <TreeNodeComponent
                key={childId}
                node={child}
                config={config}
                level={level + 1}
                expanded={expanded}
                onToggle={onToggle}
                onNodeClick={onNodeClick}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function TreeView<T extends object>({
  nodes,
  config,
  expanded,
  onToggle,
  onNodeClick,
}: {
  nodes: TreeNode<T>[];
  config: HierarchyPageConfig;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onNodeClick?: (node: T) => void;
}) {
  return (
    <div className="space-y-1">
      {nodes.map((node) => {
        const record = node.data as Record<string, unknown>;
        const id = String(record[config.node.idField] ?? "");
        return (
          <TreeNodeComponent
            key={id}
            node={node}
            config={config}
            level={0}
            expanded={expanded}
            onToggle={onToggle}
            onNodeClick={onNodeClick}
          />
        );
      })}
    </div>
  );
}

function OrgChartNode<T extends object>({
  node,
  config,
  onNodeClick,
}: {
  node: TreeNode<T>;
  config: HierarchyPageConfig;
  onNodeClick?: (node: T) => void;
}) {
  const record = node.data as Record<string, unknown>;
  const label = String(record[config.node.labelField] ?? "");
  const subtitle = config.node.subtitleField ? String(record[config.node.subtitleField] ?? "") : undefined;
  const avatar = config.node.avatarField ? String(record[config.node.avatarField] ?? "") : undefined;
  const badge = config.node.badgeField ? String(record[config.node.badgeField] ?? "") : undefined;

  return (
    <div className="flex flex-col items-center">
      <Card
        className="w-48 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onNodeClick?.(node.data)}
      >
        <CardContent className="p-4 text-center">
          {avatar && (
            <Avatar className="h-16 w-16 mx-auto mb-2">
              <AvatarImage src={avatar} />
              <AvatarFallback>{label.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
          <p className="font-medium truncate">{label}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
          {badge && (
            <Badge variant="secondary" className="mt-2">{badge}</Badge>
          )}
        </CardContent>
      </Card>

      {node.children.length > 0 && (
        <>
          <div className="w-px h-6 bg-border" />
          <div className="flex items-start gap-4">
            {node.children.map((child, index) => {
              const childRecord = child.data as Record<string, unknown>;
              const childId = String(childRecord[config.node.idField] ?? "");
              return (
                <div key={childId} className="flex flex-col items-center">
                  {node.children.length > 1 && (
                    <div className={cn(
                      "h-px bg-border",
                      index === 0 ? "w-1/2 self-end" :
                      index === node.children.length - 1 ? "w-1/2 self-start" :
                      "w-full"
                    )} />
                  )}
                  <div className="w-px h-6 bg-border" />
                  <OrgChartNode node={child} config={config} onNodeClick={onNodeClick} />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function OrgChartView<T extends object>({
  nodes,
  config,
  onNodeClick,
}: {
  nodes: TreeNode<T>[];
  config: HierarchyPageConfig;
  onNodeClick?: (node: T) => void;
}) {
  return (
    <div className="flex justify-center overflow-auto p-8">
      <div className="flex gap-8">
        {nodes.map((node) => {
          const record = node.data as Record<string, unknown>;
          const id = String(record[config.node.idField] ?? "");
          return <OrgChartNode key={id} node={node} config={config} onNodeClick={onNodeClick} />;
        })}
      </div>
    </div>
  );
}

export function HierarchyPage<T extends object>({
  config,
  data,
  getNodeId,
  onAction,
  onNodeClick,
}: HierarchyPageProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [expanded, setExpanded] = React.useState<Set<string>>(() => {
    if (config.tree?.defaultExpanded === true) {
      return new Set(data.map(getNodeId));
    }
    return new Set();
  });
  const [zoom, setZoom] = React.useState(100);

  const tree = React.useMemo(
    () => buildTree(data, config.node.idField, config.node.parentField),
    [data, config.node.idField, config.node.parentField]
  );

  const filteredTree = React.useMemo(() => {
    if (!searchQuery) return tree;
    const query = searchQuery.toLowerCase();
    
    const filterNodes = (nodes: TreeNode<T>[]): TreeNode<T>[] => {
      return nodes.reduce((acc, node) => {
        const record = node.data as Record<string, unknown>;
        const label = String(record[config.node.labelField] ?? "").toLowerCase();
        const matchesSearch = label.includes(query);
        const filteredChildren = filterNodes(node.children);
        
        if (matchesSearch || filteredChildren.length > 0) {
          acc.push({ ...node, children: filteredChildren });
        }
        return acc;
      }, [] as TreeNode<T>[]);
    };
    
    return filterNodes(tree);
  }, [tree, searchQuery, config.node.labelField]);

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

  const expandAll = () => {
    setExpanded(new Set(data.map(getNodeId)));
  };

  const collapseAll = () => {
    setExpanded(new Set());
  };

  const actions = (
    <div className="flex items-center gap-2">
      {config.toolbar?.expandAll && (
        <Button variant="outline" size="sm" onClick={expandAll}>
          <Expand className="mr-2 h-4 w-4" />
          Expand All
        </Button>
      )}
      {config.toolbar?.collapseAll && (
        <Button variant="outline" size="sm" onClick={collapseAll}>
          <Shrink className="mr-2 h-4 w-4" />
          Collapse All
        </Button>
      )}
      {config.toolbar?.zoom && (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setZoom((z) => Math.max(50, z - 25))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm w-12 text-center">{zoom}%</span>
          <Button variant="ghost" size="icon" onClick={() => setZoom((z) => Math.min(150, z + 25))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      )}
      {config.toolbar?.fullscreen && (
        <Button variant="outline" size="icon">
          <Maximize className="h-4 w-4" />
        </Button>
      )}
      {config.toolbar?.export?.enabled && (
        <Button variant="outline" size="sm" onClick={() => onAction?.("export")}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={config.title}
        description={config.description}
        actions={actions}
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

      <Card>
        <CardContent className="p-4" style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}>
          {filteredTree.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No items found</p>
          ) : config.viewType === "org-chart" ? (
            <OrgChartView nodes={filteredTree} config={config} onNodeClick={onNodeClick} />
          ) : (
            <TreeView
              nodes={filteredTree}
              config={config}
              expanded={expanded}
              onToggle={toggleExpand}
              onNodeClick={onNodeClick}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
