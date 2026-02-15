"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Settings, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DashboardLayoutConfig } from "./types";

function getDashboardGridGapStyle(gap: number | undefined): React.CSSProperties {
  return { gap: gap || 16 };
}

/**
 * DASHBOARD LAYOUT
 * 
 * Unified dashboard layout with bento grid widgets.
 * 2026 Best Practices:
 * - Responsive bento grid
 * - Widget personalization
 * - Date range filtering
 * - Auto-refresh support
 * - Drag-and-drop reordering (when enabled)
 */

export interface DashboardLayoutProps {
  config: DashboardLayoutConfig;
  loading?: boolean;
  
  dateRange?: string;
  onDateRangeChange?: (range: string) => void;
  
  onRefresh?: () => void;
  onCustomize?: () => void;
  
  children: React.ReactNode;
}

export function DashboardLayout({
  config,
  loading = false,
  dateRange,
  onDateRangeChange,
  onRefresh,
  onCustomize,
  children,
}: DashboardLayoutProps) {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = React.useCallback(async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  }, [onRefresh]);

  React.useEffect(() => {
    if (!config.refresh?.enabled || !config.refresh.intervalMs) return;
    
    const interval = setInterval(() => {
      handleRefresh();
    }, config.refresh.intervalMs);
    
    return () => clearInterval(interval);
  }, [config.refresh, handleRefresh]);

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="border-b p-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex-1 p-6">
          <div className={cn(
            "grid gap-4",
            config.layout?.columns === 2 && "grid-cols-1 md:grid-cols-2",
            config.layout?.columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
            (!config.layout?.columns || config.layout.columns >= 4) && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          )}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{config.title}</h1>
            {config.description && (
              <p className="text-muted-foreground">{config.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {config.dateRange?.enabled && (
              <Select value={dateRange} onValueChange={onDateRangeChange}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  {config.dateRange.presets?.map((preset) => (
                    <SelectItem key={preset} value={preset}>{preset}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {onRefresh && (
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              </Button>
            )}

            {config.personalization?.enabled && onCustomize && (
              <Button variant="outline" size="icon" onClick={onCustomize}>
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Widget Grid */}
      <main className="flex-1 overflow-auto p-6">
        <div 
          className={cn(
            "grid gap-4",
            config.layout?.columns === 2 && "grid-cols-1 md:grid-cols-2",
            config.layout?.columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
            (!config.layout?.columns || config.layout.columns >= 4) && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          )}
          style={getDashboardGridGapStyle(config.layout?.gap)}
        >
          {children}
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
