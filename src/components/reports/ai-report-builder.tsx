'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AI REPORT BUILDER — Natural Language → Report (G1)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * User types a natural language query, AI generates a report config,
 * then renders it via ReportChart. Reuses existing Copilot infrastructure.
 */

import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Send, RotateCcw, Save, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReportChart } from './report-chart';
import type { ReportChartType, ReportMetric } from '@/lib/reports/types';

interface AIReportResult {
  title: string;
  description: string;
  chartType: ReportChartType;
  metrics: ReportMetric[];
  dimensionKey: string;
  data: Record<string, unknown>[];
  sql?: string;
}

const EXAMPLE_QUERIES = [
  'Revenue by client this quarter',
  'Team utilization for the last 6 months',
  'Top 10 projects by profitability',
  'Pipeline value by stage',
  'Budget burn rate across active projects',
  'Monthly expenses by category',
];

interface AIReportBuilderProps {
  onSave?: (report: AIReportResult) => void;
  className?: string;
}

export function AIReportBuilder({ onSave, className }: AIReportBuilderProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIReportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/reports/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to generate report' }));
        throw new Error(err.error || 'Failed to generate report');
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const handleExampleClick = useCallback((example: string) => {
    setQuery(example);
    inputRef.current?.focus();
  }, []);

  const handleReset = useCallback(() => {
    setQuery('');
    setResult(null);
    setError(null);
    inputRef.current?.focus();
  }, []);

  return (
    <div className={cn('space-y-4', className)}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Report Builder</CardTitle>
              <CardDescription>Describe the report you need in plain language</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Show me revenue by client for Q4..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button onClick={handleSubmit} disabled={isLoading || !query.trim()} className="gap-1.5">
              <Send className="h-4 w-4" />
              Generate
            </Button>
          </div>

          {!result && !isLoading && (
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-muted-foreground mr-1">Try:</span>
              {EXAMPLE_QUERIES.map((example) => (
                <Badge
                  key={example}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent transition-colors text-xs"
                  onClick={() => handleExampleClick(example)}
                >
                  {example}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 animate-pulse text-primary" />
              Analyzing your request and generating report...
            </div>
            <Skeleton className="h-[350px] w-full" />
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" className="mt-2 gap-1" onClick={handleReset}>
              <RotateCcw className="h-3.5 w-3.5" />
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">{result.title}</CardTitle>
              <CardDescription>{result.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {onSave && (
                <Button variant="outline" size="sm" className="gap-1" onClick={() => onSave(result)}>
                  <Save className="h-3.5 w-3.5" />
                  Save
                </Button>
              )}
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
              <Button variant="ghost" size="sm" className="gap-1" onClick={handleReset}>
                <RotateCcw className="h-3.5 w-3.5" />
                New
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ReportChart
              chartType={result.chartType}
              data={result.data}
              metrics={result.metrics}
              dimensionKey={result.dimensionKey}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
