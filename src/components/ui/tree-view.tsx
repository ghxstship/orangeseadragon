"use client";

import * as React from "react";
import { ChevronRight, Folder, FolderOpen, File } from "lucide-react";
import { cn } from "@/lib/utils";

interface TreeNode {
  id: string;
  name: string;
  icon?: React.ElementType;
  children?: TreeNode[];
  data?: Record<string, unknown>;
}

interface TreeViewProps {
  data: TreeNode[];
  onSelect?: (node: TreeNode) => void;
  selectedId?: string;
  defaultExpandedIds?: string[];
  showIcons?: boolean;
  className?: string;
}

interface TreeItemProps {
  node: TreeNode;
  level: number;
  onSelect?: (node: TreeNode) => void;
  selectedId?: string;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  showIcons?: boolean;
}

const getTreeItemPaddingStyle = (level: number): React.CSSProperties => ({
  paddingLeft: `${level * 12 + 8}px`,
});

function TreeItem({
  node,
  level,
  onSelect,
  selectedId,
  expandedIds,
  onToggle,
  showIcons = true,
}: TreeItemProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;

  const handleClick = () => {
    if (hasChildren) {
      onToggle(node.id);
    }
    onSelect?.(node);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
    if (e.key === "ArrowRight" && hasChildren && !isExpanded) {
      e.preventDefault();
      onToggle(node.id);
    }
    if (e.key === "ArrowLeft" && hasChildren && isExpanded) {
      e.preventDefault();
      onToggle(node.id);
    }
  };

  const Icon = node.icon || (hasChildren ? (isExpanded ? FolderOpen : Folder) : File);

  return (
    <div role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined} aria-selected={isSelected}>
      <div
        className={cn(
          "flex items-center gap-1 rounded-md px-2 py-1.5 text-sm cursor-pointer transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:outline-none focus:bg-accent focus:text-accent-foreground",
          isSelected && "bg-accent text-accent-foreground font-medium"
        )}
        style={getTreeItemPaddingStyle(level)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
      >
        <span
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center",
            !hasChildren && "invisible"
          )}
        >
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-200",
              isExpanded && "rotate-90"
            )}
          />
        </span>
        {showIcons && <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />}
        <span className="truncate">{node.name}</span>
      </div>
      {hasChildren && isExpanded && (
        <div role="group">
          {node.children!.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onToggle={onToggle}
              showIcons={showIcons}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface TreeViewRef {
  expandAll: () => void;
  collapseAll: () => void;
}

const TreeViewComponent = React.forwardRef<TreeViewRef, TreeViewProps>(
  function TreeViewComponent(
    {
      data,
      onSelect,
      selectedId,
      defaultExpandedIds = [],
      showIcons = true,
      className,
    },
    ref
  ) {
    const [expandedIds, setExpandedIds] = React.useState<Set<string>>(
      new Set(defaultExpandedIds)
    );

    const handleToggle = React.useCallback((id: string) => {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    }, []);

    const expandAll = React.useCallback(() => {
      const getAllIds = (nodes: TreeNode[]): string[] => {
        return nodes.flatMap((node) => [
          node.id,
          ...(node.children ? getAllIds(node.children) : []),
        ]);
      };
      setExpandedIds(new Set(getAllIds(data)));
    }, [data]);

    const collapseAll = React.useCallback(() => {
      setExpandedIds(new Set());
    }, []);

    React.useImperativeHandle(ref, () => ({
      expandAll,
      collapseAll,
    }));

    return (
      <div
        role="tree"
        className={cn("select-none", className)}
        aria-label="Tree view"
      >
        {data.map((node) => (
          <TreeItem
            key={node.id}
            node={node}
            level={0}
            onSelect={onSelect}
            selectedId={selectedId}
            expandedIds={expandedIds}
            onToggle={handleToggle}
            showIcons={showIcons}
          />
        ))}
      </div>
    );
  }
);

const TreeView = TreeViewComponent;

export { TreeView, type TreeViewRef, type TreeNode };
