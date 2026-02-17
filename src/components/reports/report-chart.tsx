'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * REPORT CHART — Reusable Recharts renderer for any ReportTemplateDefinition
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Renders the correct Recharts chart based on `chartType`.
 * Used by ReportViewer, dashboard widgets, and AI report builder.
 */

import React, { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ReportChartType, ReportMetric, ReportTarget } from '@/lib/reports/types';

const TOOLTIP_STYLE: React.CSSProperties = {
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
};

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--semantic-success))',
  'hsl(var(--semantic-warning))',
  'hsl(var(--destructive))',
  'hsl(var(--semantic-info))',
  'hsl(var(--muted-foreground))',
  'hsl(var(--accent-foreground))',
  'hsl(var(--secondary-foreground))',
];

interface ReportChartProps {
  title?: string;
  description?: string;
  chartType: ReportChartType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  metrics: ReportMetric[];
  dimensionKey: string;
  targets?: ReportTarget[];
  height?: number;
  className?: string;
  showLegend?: boolean;
  compact?: boolean;
}

export function ReportChart({
  title,
  description,
  chartType,
  data,
  metrics,
  dimensionKey,
  targets,
  height = 350,
  className,
  showLegend = true,
  compact = false,
}: ReportChartProps) {
  const chartHeight = compact ? 200 : height;

  const chart = useMemo(() => {
    switch (chartType) {
      case 'bar':
      case 'horizontal-bar':
        return (
          <BarChart data={data} layout={chartType === 'horizontal-bar' ? 'vertical' : 'horizontal'}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            {chartType === 'horizontal-bar' ? (
              <>
                <XAxis type="number" className="text-xs fill-muted-foreground" />
                <YAxis dataKey={dimensionKey} type="category" width={120} className="text-xs fill-muted-foreground" />
              </>
            ) : (
              <>
                <XAxis dataKey={dimensionKey} className="text-xs fill-muted-foreground" />
                <YAxis className="text-xs fill-muted-foreground" />
              </>
            )}
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            {showLegend && <Legend />}
            {metrics.map((m, i) => (
              <Bar key={m.key} dataKey={m.key} name={m.label} fill={m.color || CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
            ))}
            {targets?.map((t) => (
              <ReferenceLine key={t.metricKey} y={t.value} stroke={t.color || 'hsl(var(--destructive))'} strokeDasharray="5 5" label={t.label} />
            ))}
          </BarChart>
        );

      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey={dimensionKey} className="text-xs fill-muted-foreground" />
            <YAxis className="text-xs fill-muted-foreground" />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            {showLegend && <Legend />}
            {metrics.map((m, i) => (
              <Line key={m.key} type="monotone" dataKey={m.key} name={m.label} stroke={m.color || CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={false} />
            ))}
            {targets?.map((t) => (
              <ReferenceLine key={t.metricKey} y={t.value} stroke={t.color || 'hsl(var(--destructive))'} strokeDasharray="5 5" label={t.label} />
            ))}
          </LineChart>
        );

      case 'area':
      case 'stacked-area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey={dimensionKey} className="text-xs fill-muted-foreground" />
            <YAxis className="text-xs fill-muted-foreground" />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            {showLegend && <Legend />}
            {metrics.map((m, i) => (
              <Area
                key={m.key}
                type="monotone"
                dataKey={m.key}
                name={m.label}
                stroke={m.color || CHART_COLORS[i % CHART_COLORS.length]}
                fill={m.color || CHART_COLORS[i % CHART_COLORS.length]}
                fillOpacity={0.15}
                stackId={chartType === 'stacked-area' ? 'stack' : undefined}
              />
            ))}
          </AreaChart>
        );

      case 'pie':
      case 'donut':
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={metrics[0]?.key || 'value'}
              nameKey={dimensionKey}
              cx="50%"
              cy="50%"
              innerRadius={chartType === 'donut' ? '55%' : 0}
              outerRadius="80%"
              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            {showLegend && <Legend />}
          </PieChart>
        );

      case 'radar':
        return (
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="80%">
            <PolarGrid className="stroke-border" />
            <PolarAngleAxis dataKey={dimensionKey} className="text-xs fill-muted-foreground" />
            <PolarRadiusAxis className="text-xs fill-muted-foreground" />
            {metrics.map((m, i) => (
              <Radar key={m.key} name={m.label} dataKey={m.key} stroke={m.color || CHART_COLORS[i % CHART_COLORS.length]} fill={m.color || CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.2} />
            ))}
            {showLegend && <Legend />}
          </RadarChart>
        );

      case 'scatter':
        return (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey={dimensionKey} className="text-xs fill-muted-foreground" />
            <YAxis className="text-xs fill-muted-foreground" />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Scatter data={data} fill={CHART_COLORS[0]} />
          </ScatterChart>
        );

      case 'kpi':
        return null;

      case 'funnel':
        return (
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis type="number" className="text-xs fill-muted-foreground" />
            <YAxis dataKey={dimensionKey} type="category" width={120} className="text-xs fill-muted-foreground" />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            {metrics.map((m, i) => (
              <Bar key={m.key} dataKey={m.key} name={m.label} fill={m.color || CHART_COLORS[i % CHART_COLORS.length]} radius={[0, 4, 4, 0]} />
            ))}
          </BarChart>
        );

      default:
        return null;
    }
  }, [chartType, data, metrics, dimensionKey, targets, showLegend]);

  if (chartType === 'kpi') {
    return (
      <div className={cn('grid gap-4 grid-cols-2 md:grid-cols-4', className)}>
        {metrics.map((m) => {
          const val = data[0]?.[m.key];
          return (
            <Card key={m.key}>
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em]">{m.label}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{String(val ?? '—')}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  const content = (
    <ResponsiveContainer width="100%" height={chartHeight}>
      {chart || <div />}
    </ResponsiveContainer>
  );

  if (!title) return <div className={className}>{content}</div>;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
