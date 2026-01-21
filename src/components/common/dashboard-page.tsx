"use client";

import * as React from "react";
import { PageHeader } from "./page-header";
import { StatCard, StatGrid } from "./stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, TrendingUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  DashboardPageConfig,
  WidgetConfig,
  StatWidgetConfig,
  ListWidgetConfig,
  ActivityWidgetConfig,
  AlertsWidgetConfig,
  QuickActionsWidgetConfig,
  ProgressWidgetConfig,
} from "@/config/pages/dashboard-types";

export interface DashboardPageProps {
  config: DashboardPageConfig;
  data: Record<string, unknown[]>;
  stats?: Record<string, { value: string | number; trend?: number }>;
  onAction?: (actionId: string, payload?: unknown) => void;
  onRefresh?: () => void;
  loading?: boolean;
}

function StatWidget({ widget, stats }: { widget: StatWidgetConfig; stats?: Record<string, { value: string | number; trend?: number }> }) {
  const stat = stats?.[widget.id];
  const value = stat?.value ?? 0;

  const formattedValue = widget.format === "currency"
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(Number(value))
    : widget.format === "percentage"
    ? `${value}%`
    : String(value);

  return (
    <StatCard
      title={widget.title}
      value={formattedValue}
    />
  );
}

function ListWidget({ widget, data }: { widget: ListWidgetConfig; data: unknown[] }) {
  const items = data.slice(0, widget.limit ?? 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {widget.emptyMessage ?? "No items"}
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => {
              const record = item as Record<string, unknown>;
              return (
                <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{String(record[widget.titleField] ?? "")}</p>
                    {widget.subtitleField && (
                      <p className="text-xs text-muted-foreground">
                        {String(record[widget.subtitleField] ?? "")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {widget.badgeField && record[widget.badgeField] ? (
                      <Badge variant="secondary">{String(record[widget.badgeField])}</Badge>
                    ) : null}
                    {widget.metaField && record[widget.metaField] ? (
                      <span className="text-xs text-muted-foreground">
                        {String(record[widget.metaField])}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityWidget({ widget, data }: { widget: ActivityWidgetConfig; data: unknown[] }) {
  const items = data.slice(0, widget.limit ?? 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{widget.title}</CardTitle>
        <CardDescription>Latest updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => {
            const record = item as Record<string, unknown>;
            return (
              <div key={index} className="flex items-start gap-4 rounded-lg border p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{String(record[widget.actionField] ?? "")}</p>
                  <p className="text-sm text-muted-foreground">
                    {String(record[widget.descriptionField] ?? "")}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{String(record[widget.userField] ?? "")}</span>
                    <span>•</span>
                    <span>{String(record[widget.timeField] ?? "")}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function AlertsWidget({ widget, data }: { widget: AlertsWidgetConfig; data: unknown[] }) {
  const items = data.slice(0, widget.limit ?? 5);

  const severityColors: Record<string, string> = {
    critical: "bg-red-500/10 text-red-700",
    high: "bg-orange-500/10 text-orange-700",
    warning: "bg-yellow-500/10 text-yellow-700",
    info: "bg-blue-500/10 text-blue-700",
    low: "bg-gray-500/10 text-gray-700",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          {widget.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, index) => {
            const record = item as Record<string, unknown>;
            const severity = String(record[widget.severityField] ?? "info").toLowerCase();
            return (
              <div key={index} className={cn("rounded-lg p-3", severityColors[severity] ?? severityColors.info)}>
                <p className="text-sm font-medium">{String(record[widget.messageField] ?? "")}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionsWidget({ widget, onAction }: { widget: QuickActionsWidgetConfig; onAction?: (actionId: string) => void }) {
  const cols = widget.columns ?? 2;
  const gridCols = cols === 2 ? "grid-cols-2" : cols === 3 ? "grid-cols-3" : "grid-cols-4";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("grid gap-2", gridCols)}>
          {widget.actions.map((action) => (
            <button
              key={action.id}
              onClick={() => action.action ? onAction?.(action.action) : undefined}
              className="flex flex-col items-center justify-center rounded-lg border p-4 hover:bg-accent transition-colors"
            >
              <span className="text-xs">{action.label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ProgressWidget({ widget, data }: { widget: ProgressWidgetConfig; data: Record<string, unknown> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {widget.items.map((item, index) => {
            const value = Number(data[item.valueField] ?? 0);
            const max = item.maxField ? Number(data[item.maxField] ?? 100) : (item.max ?? 100);
            const percentage = Math.min((value / max) * 100, 100);

            const formattedValue = item.format === "currency"
              ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(value)
              : item.format === "percentage"
              ? `${value}%`
              : String(value);

            return (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{item.label}</span>
                  <span className="font-medium">{formattedValue}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardWidget({
  widget,
  data,
  stats,
  onAction,
}: {
  widget: WidgetConfig;
  data: Record<string, unknown[]>;
  stats?: Record<string, { value: string | number; trend?: number }>;
  onAction?: (actionId: string) => void;
}) {
  switch (widget.type) {
    case "stat":
      return <StatWidget widget={widget} stats={stats} />;
    case "list":
      return <ListWidget widget={widget} data={data[widget.dataSource] ?? []} />;
    case "activity":
      return <ActivityWidget widget={widget} data={data[widget.dataSource] ?? []} />;
    case "alerts":
      return <AlertsWidget widget={widget} data={data[widget.dataSource] ?? []} />;
    case "quick-actions":
      return <QuickActionsWidget widget={widget} onAction={onAction} />;
    case "progress":
      return <ProgressWidget widget={widget} data={data as unknown as Record<string, unknown>} />;
    default:
      return null;
  }
}

export function DashboardPage({
  config,
  data,
  stats,
  onAction,
  onRefresh,
  loading = false,
}: DashboardPageProps) {
  const [dateRange, setDateRange] = React.useState<string>(config.dateRange?.default ?? "month");

  const statWidgets = config.widgets.filter((w): w is StatWidgetConfig => w.type === "stat");
  const otherWidgets = config.widgets.filter((w) => w.type !== "stat");

  const actions = (
    <div className="flex items-center gap-2">
      {config.dateRange?.enabled && (
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      )}
      {onRefresh && (
        <Button variant="outline" size="icon" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
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

      {statWidgets.length > 0 && (
        <StatGrid columns={Math.min(statWidgets.length, 4) as 2 | 3 | 4}>
          {statWidgets.map((widget) => (
            <StatWidget key={widget.id} widget={widget} stats={stats} />
          ))}
        </StatGrid>
      )}

      <div className={cn(
        "grid gap-4",
        config.layout?.columns === 2 ? "md:grid-cols-2" :
        config.layout?.columns === 3 ? "md:grid-cols-3" :
        "md:grid-cols-2 lg:grid-cols-3"
      )}>
        {otherWidgets.map((widget) => (
          <DashboardWidget
            key={widget.id}
            widget={widget}
            data={data}
            stats={stats}
            onAction={onAction}
          />
        ))}
      </div>
    </div>
  );
}
