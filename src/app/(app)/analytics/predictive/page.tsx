"use client";

/**
 * Predictive Analytics Dashboard
 * Forecast visualizations for revenue, budgets, utilization, and expenses.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TrendingUp, TrendingDown, Minus, BarChart3, DollarSign,
  Users, Receipt, AlertTriangle, RefreshCw, Sparkles,
  ArrowUpRight, ArrowDownRight, Activity,
} from "lucide-react";
import { useCopilotContext } from "@/hooks/use-copilot-context";
import { captureError } from '@/lib/observability';

// ── Types ────────────────────────────────────────────────────────────────

interface TimeSeriesPoint {
  date: string;
  value: number;
}

interface ForecastPoint extends TimeSeriesPoint {
  lower_bound: number;
  upper_bound: number;
  confidence: number;
}

interface ForecastData {
  type: string;
  historical: TimeSeriesPoint[];
  forecast: ForecastPoint[];
  trend: "increasing" | "decreasing" | "stable";
  trend_pct: number;
  model_accuracy: number;
  summary: string;
  seasonality_detected?: boolean;
  pipeline_value?: number;
  win_rate?: number;
}

// ── Sparkline SVG ────────────────────────────────────────────────────────

function Sparkline({
  data,
  forecast,
  width = 300,
  height = 120,
  className,
}: {
  data: TimeSeriesPoint[];
  forecast?: ForecastPoint[];
  width?: number;
  height?: number;
  className?: string;
}) {
  const allPoints = [...data, ...(forecast || [])];
  if (allPoints.length < 2) return null;

  const values = allPoints.map((p) => p.value);
  const min = Math.min(...values, ...(forecast || []).map((f) => f.lower_bound));
  const max = Math.max(...values, ...(forecast || []).map((f) => f.upper_bound));
  const range = max - min || 1;
  const padding = 8;

  const scaleX = (i: number) => padding + (i / (allPoints.length - 1)) * (width - padding * 2);
  const scaleY = (v: number) => height - padding - ((v - min) / range) * (height - padding * 2);

  // Historical line
  const histPath = data.map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(i)} ${scaleY(p.value)}`).join(" ");

  // Forecast line
  const forecastStartIdx = data.length - 1;
  const forecastPath = forecast
    ? [
        `M ${scaleX(forecastStartIdx)} ${scaleY(data[data.length - 1]?.value || 0)}`,
        ...forecast.map((p, i) => `L ${scaleX(forecastStartIdx + 1 + i)} ${scaleY(p.value)}`),
      ].join(" ")
    : "";

  // Confidence band
  const bandPath = forecast
    ? [
        `M ${scaleX(forecastStartIdx)} ${scaleY(data[data.length - 1]?.value || 0)}`,
        ...forecast.map((p, i) => `L ${scaleX(forecastStartIdx + 1 + i)} ${scaleY(p.upper_bound)}`),
        ...forecast.map((_p, i) => `L ${scaleX(forecastStartIdx + 1 + forecast.length - 1 - i)} ${scaleY(forecast[forecast.length - 1 - i]?.lower_bound ?? 0)}`),
        "Z",
      ].join(" ")
    : "";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn("w-full", className)}>
      {/* Confidence band */}
      {bandPath && <path d={bandPath} className="fill-primary/10" />}

      {/* Divider line between historical and forecast */}
      {forecast && forecast.length > 0 && (
        <line
          x1={scaleX(forecastStartIdx)}
          y1={padding}
          x2={scaleX(forecastStartIdx)}
          y2={height - padding}
          className="stroke-border"
          strokeWidth={1}
          strokeDasharray="4 2"
        />
      )}

      {/* Historical line */}
      <path d={histPath} fill="none" className="stroke-primary" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

      {/* Forecast line */}
      {forecastPath && (
        <path d={forecastPath} fill="none" className="stroke-primary" strokeWidth={2} strokeDasharray="6 3" strokeLinecap="round" />
      )}

      {/* Data points */}
      {data.slice(-5).map((p, i) => {
        const idx = data.length - 5 + i;
        if (idx < 0) return null;
        return (
          <circle key={`h-${idx}`} cx={scaleX(idx)} cy={scaleY(p.value)} r={2.5} className="fill-primary" />
        );
      })}

      {/* Forecast points */}
      {forecast?.map((p, i) => (
        <circle key={`f-${i}`} cx={scaleX(forecastStartIdx + 1 + i)} cy={scaleY(p.value)} r={2.5} className="fill-primary/50" />
      ))}
    </svg>
  );
}

// ── KPI Card ─────────────────────────────────────────────────────────────

function KPICard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  subtitle,
}: {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "stable";
  icon: React.ElementType;
  subtitle?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            trend === "up" ? "text-semantic-success" : trend === "down" ? "text-destructive" : "text-muted-foreground"
          )}>
            {trend === "up" ? <ArrowUpRight className="h-3.5 w-3.5" /> : trend === "down" ? <ArrowDownRight className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
            {change}
          </div>
        </div>
        <p className="text-2xl font-bold font-mono tabular-nums">{value}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{title}</p>
        {subtitle && <p className="text-[9px] text-muted-foreground/60 mt-0.5">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

// ── Forecast Card ────────────────────────────────────────────────────────

function ForecastCard({
  data,
  isLoading,
  title,
  icon: Icon,
  formatValue,
}: {
  data: ForecastData | null;
  isLoading: boolean;
  title: string;
  icon: React.ElementType;
  formatValue?: (v: number) => string;
}) {
  const fmt = formatValue || ((v: number) => `$${Math.round(v).toLocaleString()}`);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Icon className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const TrendIcon = data.trend === "increasing" ? TrendingUp : data.trend === "decreasing" ? TrendingDown : Minus;
  const trendColor = data.trend === "increasing" ? "text-semantic-success" : data.trend === "decreasing" ? "text-destructive" : "text-muted-foreground";

  const lastHistorical = data.historical[data.historical.length - 1];
  const lastForecast = data.forecast[data.forecast.length - 1];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm">{title}</CardTitle>
              <CardDescription className="text-[10px]">
                {data.historical.length} data points · {data.forecast.length} periods forecast
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("text-[9px] gap-1", trendColor)}>
              <TrendIcon className="h-3 w-3" />
              {data.trend_pct > 0 ? "+" : ""}{data.trend_pct}%
            </Badge>
            <Badge variant="secondary" className="text-[9px]">
              {data.model_accuracy}% accuracy
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Chart */}
        <Sparkline data={data.historical} forecast={data.forecast} height={140} />

        {/* Legend */}
        <div className="flex items-center gap-4 text-[9px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-primary rounded" />
            <span>Historical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-0 w-4 border-t-2 border-dashed border-primary" />
            <span>Forecast</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-2 bg-primary/10 rounded" />
            <span>Confidence Band</span>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/30">
          <div>
            <p className="text-[9px] text-muted-foreground">Current</p>
            <p className="text-sm font-bold font-mono">{lastHistorical ? fmt(lastHistorical.value) : "—"}</p>
          </div>
          <div>
            <p className="text-[9px] text-muted-foreground">Forecast End</p>
            <p className="text-sm font-bold font-mono">{lastForecast ? fmt(lastForecast.value) : "—"}</p>
          </div>
          <div>
            <p className="text-[9px] text-muted-foreground">Confidence</p>
            <p className="text-sm font-bold font-mono">{lastForecast ? `${Math.round(lastForecast.confidence * 100)}%` : "—"}</p>
          </div>
        </div>

        {/* AI Summary */}
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
          <Sparkles className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">{data.summary}</p>
        </div>

        {data.seasonality_detected && (
          <Badge variant="outline" className="text-[9px] gap-1">
            <Activity className="h-3 w-3" />
            Seasonal patterns detected
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────

export default function PredictiveAnalyticsPage() {
  useCopilotContext({ module: "analytics", entityType: "forecast" });

  const [activeTab, setActiveTab] = React.useState("revenue");
  const [periods, setPeriods] = React.useState("8");
  const [isLoading, setIsLoading] = React.useState(true);
  const [forecasts, setForecasts] = React.useState<Record<string, ForecastData>>({});

  const fetchForecast = React.useCallback(async (type: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/analytics/forecast?type=${type}&periods=${periods}`);
      if (res.ok) {
        const result = await res.json();
        if (result.data) {
          setForecasts((prev) => ({ ...prev, [type]: result.data }));
        }
      }
    } catch (err) {
      captureError(err, 'predictive.fetchForecast');
    } finally {
      setIsLoading(false);
    }
  }, [periods]);

  React.useEffect(() => {
    fetchForecast(activeTab);
  }, [activeTab, fetchForecast]);

  // Fetch all on mount
  React.useEffect(() => {
    const types = ["revenue", "expenses", "utilization"];
    types.forEach((t) => {
      fetch(`/api/analytics/forecast?type=${t}&periods=${periods}`)
        .then((r) => r.json())
        .then((result) => {
          if (result.data) {
            setForecasts((prev) => ({ ...prev, [t]: result.data }));
          }
        })
        .catch((err: unknown) => captureError(err, 'predictive.fetchAllForecasts'));
    });
    setIsLoading(false);
  }, [periods]);

  const revData = forecasts.revenue;
  const expData = forecasts.expenses;
  const utilData = forecasts.utilization;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Predictive Analytics</h1>
          <p className="text-sm text-muted-foreground">
            AI-powered forecasting for revenue, budgets, and resource utilization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={periods} onValueChange={setPeriods}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4">4 Periods</SelectItem>
              <SelectItem value="8">8 Periods</SelectItem>
              <SelectItem value="12">12 Periods</SelectItem>
              <SelectItem value="24">24 Periods</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchForecast(activeTab)}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Revenue Forecast"
          value={revData?.forecast[0] ? `$${Math.round(revData.forecast[0].value).toLocaleString()}` : "—"}
          change={revData ? `${revData.trend_pct > 0 ? "+" : ""}${revData.trend_pct}%` : "—"}
          trend={revData?.trend === "increasing" ? "up" : revData?.trend === "decreasing" ? "down" : "stable"}
          icon={DollarSign}
          subtitle="Next period projection"
        />
        <KPICard
          title="Expense Trend"
          value={expData?.forecast[0] ? `$${Math.round(expData.forecast[0].value).toLocaleString()}` : "—"}
          change={expData ? `${expData.trend_pct > 0 ? "+" : ""}${expData.trend_pct}%` : "—"}
          trend={expData?.trend === "increasing" ? "down" : expData?.trend === "decreasing" ? "up" : "stable"}
          icon={Receipt}
          subtitle="Weekly expense forecast"
        />
        <KPICard
          title="Utilization"
          value={utilData?.forecast[0] ? `${Math.round(utilData.forecast[0].value)}h` : "—"}
          change={utilData ? `${utilData.trend_pct > 0 ? "+" : ""}${utilData.trend_pct}%` : "—"}
          trend={utilData?.trend === "increasing" ? "up" : utilData?.trend === "decreasing" ? "down" : "stable"}
          icon={Users}
          subtitle="Resource hours forecast"
        />
        <KPICard
          title="Model Accuracy"
          value={revData ? `${revData.model_accuracy}%` : "—"}
          change="avg across models"
          trend="stable"
          icon={BarChart3}
          subtitle="Forecast reliability"
        />
      </div>

      {/* Forecast Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="revenue" className="gap-1.5">
            <DollarSign className="h-3.5 w-3.5" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="expenses" className="gap-1.5">
            <Receipt className="h-3.5 w-3.5" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="utilization" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Utilization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ForecastCard
              data={revData || null}
              isLoading={isLoading && !revData}
              title="Revenue Forecast"
              icon={DollarSign}
            />
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Pipeline Intelligence</CardTitle>
                <CardDescription className="text-[10px]">Weighted pipeline contributing to forecast</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {revData?.pipeline_value !== undefined ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase">Pipeline Value</p>
                        <p className="text-xl font-bold font-mono">${Math.round(revData.pipeline_value).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase">Win Rate</p>
                        <p className="text-xl font-bold font-mono">{revData.win_rate}%</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                      <Sparkles className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Weighted pipeline value of ${Math.round(revData.pipeline_value * (revData.win_rate || 35) / 100).toLocaleString()} factored into revenue projections.
                        {revData.win_rate && revData.win_rate > 40
                          ? " Win rate is above industry average — strong conversion performance."
                          : " Consider pipeline nurturing to improve conversion rates."}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">Pipeline data will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="mt-4">
          <ForecastCard
            data={expData || null}
            isLoading={isLoading && !expData}
            title="Expense Forecast"
            icon={Receipt}
          />
        </TabsContent>

        <TabsContent value="utilization" className="mt-4">
          <ForecastCard
            data={utilData || null}
            isLoading={isLoading && !utilData}
            title="Resource Utilization Forecast"
            icon={Users}
            formatValue={(v) => `${Math.round(v)}h`}
          />
        </TabsContent>
      </Tabs>

      {/* Risk Alerts */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-semantic-warning" />
            <CardTitle className="text-sm">Predictive Risk Alerts</CardTitle>
          </div>
          <CardDescription className="text-[10px]">AI-identified risks based on forecast trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {expData?.trend === "increasing" && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-semantic-warning/5 border border-semantic-warning/20">
                <AlertTriangle className="h-3.5 w-3.5 text-semantic-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-semantic-warning">Expense Growth Detected</p>
                  <p className="text-[10px] text-muted-foreground">
                    Weekly expenses trending up {expData.trend_pct}%. Review recurring costs and vendor contracts.
                  </p>
                </div>
              </div>
            )}
            {utilData?.trend === "decreasing" && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-semantic-info/5 border border-semantic-info/20">
                <Users className="h-3.5 w-3.5 text-semantic-info flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-semantic-info">Utilization Declining</p>
                  <p className="text-[10px] text-muted-foreground">
                    Resource utilization trending down {Math.abs(utilData.trend_pct)}%. Consider adjusting staffing levels.
                  </p>
                </div>
              </div>
            )}
            {(!expData || expData.trend !== "increasing") && (!utilData || utilData.trend !== "decreasing") && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-semantic-success/5 border border-semantic-success/20">
                <Activity className="h-3.5 w-3.5 text-semantic-success" />
                <p className="text-xs text-muted-foreground">No significant risk signals detected. All metrics within expected ranges.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
