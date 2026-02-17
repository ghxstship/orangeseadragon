'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * REPORT VIEWER — Reusable component that renders any ReportTemplateDefinition
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Accepts a template ID or full definition, fetches data, renders chart.
 * Used by: report library page, dashboard widgets, AI report builder,
 * scheduled report subscriptions.
 */

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, RefreshCw, Bell, Maximize2, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReportChart } from './report-chart';
import type { ReportTemplateDefinition, ReportPeriod } from '@/lib/reports/types';
import { useQuery } from '@tanstack/react-query';

interface ReportViewerProps {
  template: ReportTemplateDefinition;
  data?: Record<string, unknown>[];
  period?: ReportPeriod;
  onPeriodChange?: (period: ReportPeriod) => void;
  onSubscribe?: (templateId: string) => void;
  onExport?: (templateId: string, format: 'csv' | 'pdf') => void;
  onExpand?: (templateId: string) => void;
  compact?: boolean;
  className?: string;
}

const PERIOD_OPTIONS: { value: ReportPeriod; label: string }[] = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
];

export function ReportViewer({
  template,
  data: externalData,
  period: externalPeriod,
  onPeriodChange,
  onSubscribe,
  onExport,
  onExpand,
  compact = false,
  className,
}: ReportViewerProps) {
  const [period, setPeriod] = useState<ReportPeriod>(externalPeriod || template.defaultPeriod || 'month');

  const handlePeriodChange = useCallback((val: string) => {
    const p = val as ReportPeriod;
    setPeriod(p);
    onPeriodChange?.(p);
  }, [onPeriodChange]);

  const { data: fetchedData, isLoading, refetch } = useQuery({
    queryKey: ['report', template.id, period],
    queryFn: async () => {
      const res = await fetch(`/api/reports/execute?templateId=${template.id}&period=${period}`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !externalData,
    staleTime: 5 * 60 * 1000,
  });

  const chartData = externalData || fetchedData || [];
  const dimensionKey = template.dimensions[0]?.key || 'name';

  if (compact) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div className="min-w-0">
            <CardTitle className="text-sm font-semibold truncate">{template.name}</CardTitle>
            <CardDescription className="text-xs truncate">{template.description}</CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-[10px]">{template.category}</Badge>
            {onExpand && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onExpand(template.id)}>
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <ReportChart
              chartType={template.chartType}
              data={chartData}
              metrics={template.metrics}
              dimensionKey={dimensionKey}
              targets={template.targets}
              compact
              showLegend={false}
            />
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-bold truncate">{template.name}</CardTitle>
            <Badge variant="secondary" className="text-[10px]">{template.category}</Badge>
          </div>
          <CardDescription className="text-sm mt-0.5">{template.description}</CardDescription>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          {onSubscribe && (
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onSubscribe(template.id)}>
              <Bell className="h-3.5 w-3.5" />
            </Button>
          )}
          {onExport && (
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => onExport(template.id, 'csv')}>
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          )}
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Filter className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[350px] w-full" />
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[350px] text-muted-foreground text-sm">
            No data available for this period
          </div>
        ) : (
          <ReportChart
            chartType={template.chartType}
            data={chartData}
            metrics={template.metrics}
            dimensionKey={dimensionKey}
            targets={template.targets}
          />
        )}
      </CardContent>
    </Card>
  );
}
