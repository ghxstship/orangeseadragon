"use client";

/**
 * Node Palette
 * Draggable palette of workflow node types for the visual builder.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { PALETTE_CATEGORIES } from "@/lib/workflow-engine/visual-builder-types";
import type { PaletteItem } from "@/lib/workflow-engine/visual-builder-types";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Search, Zap, Calendar, Radio, Webhook, GitBranch, Clock, Repeat,
  GitMerge, Plus, Edit, Bell, Mail, MessageSquare, CheckCircle,
  Globe, Shuffle, Code,
} from "lucide-react";

const PALETTE_ICONS: Record<string, React.ElementType> = {
  Zap, Calendar, Radio, Webhook, GitBranch, Clock, Repeat,
  GitMerge, Plus, Edit, Search: Search, Bell, Mail, MessageSquare,
  CheckCircle, Globe, Shuffle, Code, Webhook2: Webhook,
};

function PaletteNodeItem({ item }: { item: PaletteItem }) {
  const Icon = PALETTE_ICONS[item.icon] || Zap;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(
      "application/workflow-node",
      JSON.stringify({ type: item.type, label: item.label, config: item.defaultConfig })
    );
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border/50",
        "bg-card hover:bg-accent hover:border-border cursor-grab active:cursor-grabbing",
        "transition-all duration-150 group select-none"
      )}
    >
      <div className={cn("p-1.5 rounded-md", item.color)}>
        <Icon className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">{item.label}</p>
        <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
      </div>
    </div>
  );
}

export function NodePalette() {
  const [search, setSearch] = React.useState("");

  const filteredCategories = React.useMemo(() => {
    if (!search.trim()) return PALETTE_CATEGORIES;

    const q = search.toLowerCase();
    return PALETTE_CATEGORIES.map((cat) => ({
      ...cat,
      nodes: cat.nodes.filter(
        (n) =>
          n.label.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q) ||
          n.type.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.nodes.length > 0);
  }, [search]);

  return (
    <div className="w-64 border-r border-border bg-card/50 flex flex-col h-full">
      <div className="p-3 border-b border-border/50">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2">
          Node Palette
        </p>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {filteredCategories.map((category) => (
            <div key={category.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                  {category.label}
                </p>
                <Badge variant="secondary" className="text-[9px] h-4 px-1.5">
                  {category.nodes.length}
                </Badge>
              </div>
              <div className="space-y-1.5">
                {category.nodes.map((item, idx) => (
                  <PaletteNodeItem key={`${category.id}-${idx}`} item={item} />
                ))}
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <Search className="h-6 w-6 mx-auto mb-2 opacity-30" />
              <p className="text-xs">No nodes match your search</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
