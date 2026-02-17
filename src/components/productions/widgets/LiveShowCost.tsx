"use client";

/**
 * Live Show-Cost Dashboard
 * Real-time cost accumulation during live events with WebSocket-style polling.
 * Displays running totals, burn rate, budget variance, and cost breakdown.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { captureError } from '@/lib/observability';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign, TrendingUp, TrendingDown, Clock, AlertTriangle,
  RefreshCw, Pause, Play, BarChart3,
} from "lucide-react";

interface CostLineItem {
  id: string;
  category: string;
  label: string;
  amount: number;
  timestamp: string;
  type: "labor" | "equipment" | "vendor" | "catering" | "transport" | "misc";
}

interface ShowCostData {
  event_id: string;
  event_name: string;
  budget_total: number;
  spent_total: number;
  committed_total: number;
  burn_rate_per_hour: number;
  hours_elapsed: number;
  hours_remaining: number;
  projected_total: number;
  variance: number;
  variance_pct: number;
  breakdown: { category: string; budgeted: number; actual: number; pct: number }[];
  recent_costs: CostLineItem[];
  last_updated: string;
}

interface LiveShowCostProps {
  eventId: string;
  className?: string;
  pollIntervalMs?: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

const getProjectedFillStyle = (projectedPct: number): React.CSSProperties => ({
  width: `${Math.min(projectedPct, 100)}%`,
});

const getSpentFillStyle = (spentPct: number): React.CSSProperties => ({
  width: `${spentPct}%`,
});

const getCostBreakdownFillStyle = (pct: number): React.CSSProperties => ({
  width: `${pct}%`,
});

function BudgetGauge({ spent, budget, projected }: { spent: number; budget: number; projected: number }) {
  const spentPct = Math.min((spent / budget) * 100, 100);
  const projectedPct = Math.min((projected / budget) * 100, 150);
  const isOverBudget = projected > budget;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-muted-foreground">Budget Utilization</span>
        <span className={cn("font-bold", isOverBudget ? "text-destructive" : "text-semantic-success")}>
          {Math.round(spentPct)}%
        </span>
      </div>
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        {/* Projected fill */}
        {projectedPct > spentPct && (
          <div
            className={cn("absolute inset-y-0 left-0 rounded-full opacity-30", isOverBudget ? "bg-destructive" : "bg-semantic-warning")}
            style={getProjectedFillStyle(projectedPct)}
          />
        )}
        {/* Actual fill */}
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
            spentPct >= 90 ? "bg-destructive" : spentPct >= 75 ? "bg-semantic-warning" : "bg-semantic-success"
          )}
          style={getSpentFillStyle(spentPct)}
        />
      </div>
      <div className="flex items-center justify-between text-[9px] text-muted-foreground">
        <span>{formatCurrency(spent)} spent</span>
        <span>{formatCurrency(budget)} budget</span>
      </div>
    </div>
  );
}

function CostBreakdownBar({ category, budgeted, actual }: { category: string; budgeted: number; actual: number }) {
  const pct = budgeted > 0 ? Math.min((actual / budgeted) * 100, 100) : 0;
  const isOver = actual > budgeted;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium capitalize">{category}</span>
        <span className={cn("text-[10px] font-mono", isOver ? "text-destructive" : "text-muted-foreground")}>
          {formatCurrency(actual)} / {formatCurrency(budgeted)}
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300", isOver ? "bg-destructive" : pct > 75 ? "bg-semantic-warning" : "bg-primary")}
          style={getCostBreakdownFillStyle(pct)}
        />
      </div>
    </div>
  );
}

export function LiveShowCost({ eventId, className, pollIntervalMs = 15000 }: LiveShowCostProps) {
  const [data, setData] = React.useState<ShowCostData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isPaused, setIsPaused] = React.useState(false);
  const [lastRefresh, setLastRefresh] = React.useState<Date>(new Date());

  const fetchData = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${eventId}/show-cost`);
      if (res.ok) {
        const result = await res.json();
        if (result.data) {
          setData(result.data);
          setLastRefresh(new Date());
        }
      }
    } catch (err) {
      captureError(err, 'liveShowCost.fetchCosts');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  // Initial fetch
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Polling
  React.useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(fetchData, pollIntervalMs);
    return () => clearInterval(interval);
  }, [fetchData, isPaused, pollIntervalMs]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <DollarSign className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No cost data available</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={fetchData}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isOverBudget = data.projected_total > data.budget_total;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm">Live Show Cost</CardTitle>
              <p className="text-[10px] text-muted-foreground">{data.event_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-[9px] gap-1">
              <div className={cn("w-1.5 h-1.5 rounded-full", isPaused ? "bg-semantic-warning" : "bg-semantic-success animate-pulse")} />
              {isPaused ? "Paused" : "Live"}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsPaused(!isPaused)}
              aria-label={isPaused ? "Resume updates" : "Pause updates"}
            >
              {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={fetchData} aria-label="Refresh">
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* KPI Row */}
        <div className="grid grid-cols-4 gap-3">
          <div className="space-y-0.5">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Spent</p>
            <p className="text-lg font-bold font-mono tabular-nums">{formatCurrency(data.spent_total)}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Burn Rate</p>
            <p className="text-lg font-bold font-mono tabular-nums">{formatCurrency(data.burn_rate_per_hour)}<span className="text-[9px] text-muted-foreground">/hr</span></p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Projected</p>
            <p className={cn("text-lg font-bold font-mono tabular-nums", isOverBudget && "text-destructive")}>
              {formatCurrency(data.projected_total)}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Variance</p>
            <div className="flex items-center gap-1">
              {data.variance >= 0 ? (
                <TrendingDown className="h-3.5 w-3.5 text-semantic-success" />
              ) : (
                <TrendingUp className="h-3.5 w-3.5 text-destructive" />
              )}
              <p className={cn("text-lg font-bold font-mono tabular-nums", data.variance >= 0 ? "text-semantic-success" : "text-destructive")}>
                {data.variance >= 0 ? "" : "+"}{formatCurrency(Math.abs(data.variance))}
              </p>
            </div>
          </div>
        </div>

        {/* Over-budget alert */}
        {isOverBudget && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-destructive">Over Budget Warning</p>
              <p className="text-[10px] text-destructive/80">
                Projected to exceed budget by {formatCurrency(data.projected_total - data.budget_total)} ({Math.abs(data.variance_pct).toFixed(1)}%)
              </p>
            </div>
          </div>
        )}

        {/* Budget gauge */}
        <BudgetGauge spent={data.spent_total} budget={data.budget_total} projected={data.projected_total} />

        {/* Cost breakdown */}
        {data.breakdown.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                Breakdown
              </p>
            </div>
            <div className="space-y-2.5">
              {data.breakdown.map((item) => (
                <CostBreakdownBar
                  key={item.category}
                  category={item.category}
                  budgeted={item.budgeted}
                  actual={item.actual}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent costs */}
        {data.recent_costs.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
              Recent Costs
            </p>
            <div className="space-y-1">
              {data.recent_costs.slice(0, 5).map((cost) => (
                <div key={cost.id} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[8px] h-4 px-1 capitalize">{cost.type}</Badge>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{cost.label}</span>
                  </div>
                  <span className="text-[10px] font-mono font-medium">{formatCurrency(cost.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{data.hours_elapsed.toFixed(1)}h elapsed · {data.hours_remaining.toFixed(1)}h remaining</span>
          </div>
          <span className="text-[9px] text-muted-foreground">
            Updated {lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
