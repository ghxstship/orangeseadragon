"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import type { SplitLayoutConfig } from "./types";
import { useBreakpoint } from "@/hooks/use-breakpoint";

/**
 * SPLIT LAYOUT
 * 
 * Master-detail side-by-side view.
 * 2026 Best Practices:
 * - Resizable panels
 * - Keyboard navigation (↑↓ to navigate, Enter to select)
 * - Collapsible master panel
 * - Responsive stacking on mobile
 */

export interface SplitLayoutItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: { label: string; variant?: "default" | "secondary" | "destructive" | "outline" };
  icon?: React.ReactNode;
  meta?: string;
}

export interface SplitLayoutProps {
  config: SplitLayoutConfig;
  items: SplitLayoutItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  loading?: boolean;
  
  onCreateNew?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  
  masterActions?: React.ReactNode;
  detailActions?: React.ReactNode;
  children: React.ReactNode;
}

export function SplitLayout({
  config,
  items,
  selectedId,
  onSelect,
  loading = false,
  onCreateNew,
  searchValue = "",
  onSearchChange,
  masterActions,
  detailActions,
  children,
}: SplitLayoutProps) {
  const [isMasterCollapsed, setIsMasterCollapsed] = React.useState(false);
  const [localSearch, setLocalSearch] = React.useState(searchValue);
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const listRef = React.useRef<HTMLDivElement>(null);

  const filteredItems = React.useMemo(() => {
    if (!localSearch) return items;
    const search = localSearch.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(search) ||
        item.subtitle?.toLowerCase().includes(search)
    );
  }, [items, localSearch]);

  const selectedItem = React.useMemo(
    () => items.find((item) => item.id === selectedId),
    [items, selectedId]
  );

  const handleSearchChange = React.useCallback(
    (value: string) => {
      setLocalSearch(value);
      onSearchChange?.(value);
    },
    [onSearchChange]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (!config.keyboard?.enabled) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev < filteredItems.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < filteredItems.length) {
            onSelect(filteredItems[focusedIndex].id);
          }
          break;
        case "Escape":
          e.preventDefault();
          onSelect(null);
          break;
      }
    },
    [config.keyboard?.enabled, filteredItems, focusedIndex, onSelect]
  );

  React.useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const focusedElement = listRef.current.querySelector(
        `[data-index="${focusedIndex}"]`
      );
      focusedElement?.scrollIntoView({ block: "nearest" });
    }
  }, [focusedIndex]);

  const { isMobile } = useBreakpoint();

  // ── Mobile: stacked master/detail ──
  if (isMobile) {
    const showDetail = selectedId !== null && selectedItem !== undefined;

    return (
      <div className="flex flex-col h-full bg-background" onKeyDown={handleKeyDown}>
        {showDetail ? (
          /* Detail view — full screen on mobile */
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-3 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center gap-3 min-w-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 flex-shrink-0"
                  onClick={() => onSelect(null)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="min-w-0">
                  <h1 className="font-semibold text-base truncate">{selectedItem!.title}</h1>
                  {selectedItem!.subtitle && (
                    <p className="text-sm text-muted-foreground truncate">{selectedItem!.subtitle}</p>
                  )}
                </div>
              </div>
              {detailActions && (
                <div className="flex items-center gap-2 flex-shrink-0">{detailActions}</div>
              )}
            </div>
            <div className="flex-1 overflow-auto p-4">{children}</div>
          </div>
        ) : (
          /* Master list — full screen on mobile */
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-3 border-b bg-background/80 backdrop-blur-sm">
              <h2 className="font-semibold text-lg">{config.master.title}</h2>
              <div className="flex items-center gap-2">
                {masterActions}
                {onCreateNew && (
                  <Button size="sm" onClick={onCreateNew}>
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {config.master.search?.enabled && (
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={config.master.search.placeholder}
                    value={localSearch}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-9 h-9"
                  />
                  {localSearch && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => handleSearchChange("")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            )}

            <ScrollArea className="flex-1">
              <div ref={listRef} className="p-2">
                {loading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="p-3 rounded-lg">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="font-medium text-muted-foreground">
                      {config.master.empty?.title || "No items"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {config.master.empty?.description || "No items to display"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredItems.map((item, index) => (
                      <Button
                        type="button"
                        variant="ghost"
                        key={item.id}
                        data-index={index}
                        onClick={() => onSelect(item.id)}
                        className={cn(
                          "h-auto w-full justify-start text-left p-3 rounded-lg transition-colors",
                          "hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring",
                          selectedId === item.id && "bg-accent",
                          focusedIndex === index && "ring-2 ring-ring"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {item.icon && <div className="flex-shrink-0 mt-0.5">{item.icon}</div>}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">{item.title}</span>
                              {item.badge && (
                                <Badge variant={item.badge.variant || "secondary"} className="flex-shrink-0">
                                  {item.badge.label}
                                </Badge>
                              )}
                            </div>
                            {item.subtitle && (
                              <p className="text-sm text-muted-foreground truncate mt-0.5">
                                {item.subtitle}
                              </p>
                            )}
                            {item.meta && (
                              <p className="text-xs text-muted-foreground mt-1">{item.meta}</p>
                            )}
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-3 border-t bg-background/80 backdrop-blur-sm">
              <p className="text-xs text-muted-foreground text-center">
                {filteredItems.length} of {items.length} items
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Desktop: resizable side-by-side panels ──
  return (
    <div className="flex h-full bg-background" onKeyDown={handleKeyDown}>
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Master Panel */}
        <ResizablePanel
          defaultSize={25}
          minSize={isMasterCollapsed ? 0 : 15}
          maxSize={40}
          collapsible={config.master.collapsible}
          onCollapse={() => setIsMasterCollapsed(true)}
          onExpand={() => setIsMasterCollapsed(false)}
          className={cn("transition-all duration-200", isMasterCollapsed && "min-w-0")}
        >
          {!isMasterCollapsed && (
            <div className="flex flex-col h-full border-r bg-muted/30">
              {/* Master Header */}
              <div className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm">
                <h2 className="font-semibold text-lg">{config.master.title}</h2>
                <div className="flex items-center gap-2">
                  {masterActions}
                  {onCreateNew && (
                    <Button size="sm" onClick={onCreateNew}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                  {config.master.collapsible && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setIsMasterCollapsed(true)}
                    >
                      <PanelLeftClose className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Search */}
              {config.master.search?.enabled && (
                <div className="p-3 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={config.master.search.placeholder}
                      value={localSearch}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-9 h-9"
                    />
                    {localSearch && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => handleSearchChange("")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Item List */}
              <ScrollArea className="flex-1">
                <div ref={listRef} className="p-2">
                  {loading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="p-3 rounded-lg">
                          <Skeleton className="h-5 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="font-medium text-muted-foreground">
                        {config.master.empty?.title || "No items"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {config.master.empty?.description || "No items to display"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredItems.map((item, index) => (
                        <Button
                          type="button"
                          variant="ghost"
                          key={item.id}
                          data-index={index}
                          onClick={() => onSelect(item.id)}
                          className={cn(
                            "h-auto w-full justify-start text-left p-3 rounded-lg transition-colors",
                            "hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring",
                            selectedId === item.id && "bg-accent",
                            focusedIndex === index && "ring-2 ring-ring"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            {item.icon && <div className="flex-shrink-0 mt-0.5">{item.icon}</div>}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium truncate">{item.title}</span>
                                {item.badge && (
                                  <Badge variant={item.badge.variant || "secondary"} className="flex-shrink-0">
                                    {item.badge.label}
                                  </Badge>
                                )}
                              </div>
                              {item.subtitle && (
                                <p className="text-sm text-muted-foreground truncate mt-0.5">
                                  {item.subtitle}
                                </p>
                              )}
                              {item.meta && (
                                <p className="text-xs text-muted-foreground mt-1">{item.meta}</p>
                              )}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Master Footer */}
              <div className="p-3 border-t bg-background/80 backdrop-blur-sm">
                <p className="text-xs text-muted-foreground text-center">
                  {filteredItems.length} of {items.length} items
                </p>
              </div>
            </div>
          )}
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Detail Panel */}
        <ResizablePanel defaultSize={75}>
          <div className="flex flex-col h-full">
            {isMasterCollapsed && (
              <div className="p-2 border-b">
                <Button variant="ghost" size="sm" onClick={() => setIsMasterCollapsed(false)}>
                  <PanelLeft className="h-4 w-4 mr-2" />
                  Show List
                </Button>
              </div>
            )}

            {selectedItem ? (
              <div className="flex-1 overflow-auto">
                {config.detail.header?.showBackButton && (
                  <div className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                      <div>
                        <h1 className="font-semibold text-lg">{selectedItem.title}</h1>
                        {selectedItem.subtitle && (
                          <p className="text-sm text-muted-foreground">{selectedItem.subtitle}</p>
                        )}
                      </div>
                    </div>
                    {config.detail.header?.showActions && detailActions && (
                      <div className="flex items-center gap-2">{detailActions}</div>
                    )}
                  </div>
                )}
                <div className="p-6">{children}</div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                    <ChevronRight className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg">
                    {config.detail.empty?.title || "Select an item"}
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    {config.detail.empty?.description || "Choose an item from the list to view details"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default SplitLayout;
