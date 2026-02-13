'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Download, RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';

// Chart placeholder - in production, use recharts or similar
function ChartPlaceholder({ type, title }: { type: string; title: string }) {
  return (
    <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed bg-muted/50">
      <div className="text-center">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{type} chart</p>
      </div>
    </div>
  );
}

export interface MetricCard {
  key: string;
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  format?: 'number' | 'currency' | 'percentage';
}

export interface ReportChart {
  key: string;
  title: string;
  description?: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'donut';
  data?: unknown[];
}

export interface ReportTab {
  key: string;
  label: string;
  metrics?: MetricCard[];
  charts?: ReportChart[];
}

export interface ReportsTemplateProps {
  title: string;
  description?: string;
  tabs: ReportTab[];
  dateRangeOptions?: { label: string; value: string }[];
  onDateRangeChange?: (range: { from: Date; to: Date }) => void;
  onExport?: (format: 'csv' | 'pdf' | 'xlsx') => void;
  onRefresh?: () => void;
  loading?: boolean;
}

const defaultDateRangeOptions = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'This year', value: 'ytd' },
  { label: 'Custom', value: 'custom' },
];

export function ReportsTemplate({
  title,
  description,
  tabs,
  dateRangeOptions = defaultDateRangeOptions,
  onDateRangeChange,
  onExport,
  onRefresh,
  loading = false,
}: ReportsTemplateProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.key || '');
  const [dateRange, setDateRange] = useState('30d');
  const [customDateFrom, setCustomDateFrom] = useState<Date>();
  const [customDateTo, setCustomDateTo] = useState<Date>();

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    if (value !== 'custom' && onDateRangeChange) {
      const now = new Date();
      let from = new Date();
      
      switch (value) {
        case '7d':
          from.setDate(now.getDate() - 7);
          break;
        case '30d':
          from.setDate(now.getDate() - 30);
          break;
        case '90d':
          from.setDate(now.getDate() - 90);
          break;
        case 'ytd':
          from = new Date(now.getFullYear(), 0, 1);
          break;
      }
      
      onDateRangeChange({ from, to: now });
    }
  };

  const formatMetricValue = (metric: MetricCard) => {
    const value = metric.value;
    switch (metric.format) {
      case 'currency':
        return typeof value === 'number' ? `$${value.toLocaleString()}` : value;
      case 'percentage':
        return typeof value === 'number' ? `${value}%` : value;
      default:
        return typeof value === 'number' ? value.toLocaleString() : value;
    }
  };

  const getTrendIcon = (change?: number) => {
    if (!change) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (change > 0) return <TrendingUp className="h-4 w-4 text-semantic-success" />;
    return <TrendingDown className="h-4 w-4 text-destructive" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              {dateRangeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {dateRange === 'custom' && (
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-[130px] justify-start text-left font-normal', !customDateFrom && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDateFrom ? format(customDateFrom, 'PP') : 'From'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={customDateFrom} onSelect={setCustomDateFrom} />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-[130px] justify-start text-left font-normal', !customDateTo && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDateTo ? format(customDateTo, 'PP') : 'To'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={customDateTo} onSelect={setCustomDateTo} />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <Button variant="outline" size="icon" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </Button>

          <Select onValueChange={(v) => onExport?.(v as 'csv' | 'pdf' | 'xlsx')}>
            <SelectTrigger className="w-[120px]">
              <Download className="mr-2 h-4 w-4" />
              Export
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="xlsx">Excel</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.key} value={tab.key} className="space-y-6">
            {tab.metrics && tab.metrics.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {tab.metrics.map((metric) => (
                  <Card key={metric.key}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                      {getTrendIcon(metric.change)}
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatMetricValue(metric)}</div>
                      {metric.change !== undefined && (
                        <p className={cn(
                          'text-xs',
                          metric.change > 0 ? 'text-semantic-success' : metric.change < 0 ? 'text-destructive' : 'text-muted-foreground'
                        )}>
                          {metric.change > 0 ? '+' : ''}{metric.change}% {metric.changeLabel || 'from last period'}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {tab.charts && tab.charts.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                {tab.charts.map((chart) => (
                  <Card key={chart.key} className={chart.type === 'line' || chart.type === 'area' ? 'md:col-span-2' : ''}>
                    <CardHeader>
                      <CardTitle>{chart.title}</CardTitle>
                      {chart.description && (
                        <CardDescription>{chart.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <ChartPlaceholder type={chart.type} title={chart.title} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
