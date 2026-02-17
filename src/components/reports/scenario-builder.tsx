'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SCENARIO BUILDER — Financial What-If Modeling (G3)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Create named scenarios, adjust variables (rate, headcount, expenses),
 * compare outcomes side-by-side. Reuses ReportChart for visualization.
 */

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/common/financial-display';
import { ReportChart } from './report-chart';
import type { ScenarioVariable, ScenarioDefinition, ScenarioResult } from '@/lib/reports/types';

const getColorDotStyle = (color?: string): React.CSSProperties => ({
  backgroundColor: color,
});

const SCENARIO_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--semantic-success))',
  'hsl(var(--semantic-warning))',
  'hsl(var(--destructive))',
  'hsl(var(--semantic-info))',
];

const DEFAULT_VARIABLES: ScenarioVariable[] = [
  { key: 'hourly_rate', label: 'Average Hourly Rate', type: 'currency', defaultValue: 150, min: 50, max: 500, step: 5 },
  { key: 'headcount', label: 'Team Headcount', type: 'number', defaultValue: 10, min: 1, max: 100, step: 1 },
  { key: 'utilization', label: 'Target Utilization %', type: 'percentage', defaultValue: 80, min: 40, max: 100, step: 5 },
  { key: 'overhead_pct', label: 'Overhead %', type: 'percentage', defaultValue: 30, min: 10, max: 60, step: 5 },
  { key: 'growth_rate', label: 'Monthly Growth %', type: 'percentage', defaultValue: 5, min: -10, max: 30, step: 1 },
  { key: 'avg_project_value', label: 'Avg Project Value', type: 'currency', defaultValue: 50000, min: 5000, max: 500000, step: 5000 },
];

interface ScenarioBuilderProps {
  variables?: ScenarioVariable[];
  onSave?: (scenarios: ScenarioDefinition[]) => void;
  className?: string;
}

function computeProjection(vars: Record<string, number>): ScenarioResult['monthlyProjection'] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const hoursPerMonth = 160;
  let baseRevenue = vars.headcount * hoursPerMonth * (vars.utilization / 100) * vars.hourly_rate;

  return months.map((month) => {
    const revenue = Math.round(baseRevenue);
    const cost = Math.round(revenue * (vars.overhead_pct / 100) + vars.headcount * 5000);
    const profit = revenue - cost;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    baseRevenue *= 1 + vars.growth_rate / 100;
    return { month, revenue, cost, profit, margin: Math.round(margin * 10) / 10 };
  });
}

export function ScenarioBuilder({
  variables = DEFAULT_VARIABLES,
  onSave,
  className,
}: ScenarioBuilderProps) {
  const [scenarios, setScenarios] = useState<ScenarioDefinition[]>([
    {
      id: 'baseline',
      name: 'Baseline',
      variables: Object.fromEntries(variables.map((v) => [v.key, v.defaultValue])),
      color: SCENARIO_COLORS[0],
      isBaseline: true,
    },
  ]);
  const [activeScenarioId, setActiveScenarioId] = useState('baseline');

  const activeScenario = scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];

  const addScenario = useCallback(() => {
    const idx = scenarios.length;
    const newScenario: ScenarioDefinition = {
      id: `scenario-${Date.now()}`,
      name: `Scenario ${idx + 1}`,
      variables: { ...activeScenario.variables },
      color: SCENARIO_COLORS[idx % SCENARIO_COLORS.length],
    };
    setScenarios((prev) => [...prev, newScenario]);
    setActiveScenarioId(newScenario.id);
  }, [scenarios.length, activeScenario.variables]);

  const duplicateScenario = useCallback((id: string) => {
    const source = scenarios.find((s) => s.id === id);
    if (!source) return;
    const idx = scenarios.length;
    const newScenario: ScenarioDefinition = {
      id: `scenario-${Date.now()}`,
      name: `${source.name} (Copy)`,
      variables: { ...source.variables },
      color: SCENARIO_COLORS[idx % SCENARIO_COLORS.length],
    };
    setScenarios((prev) => [...prev, newScenario]);
    setActiveScenarioId(newScenario.id);
  }, [scenarios]);

  const removeScenario = useCallback((id: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
    if (activeScenarioId === id) {
      setActiveScenarioId(scenarios[0]?.id || '');
    }
  }, [activeScenarioId, scenarios]);

  const updateVariable = useCallback((key: string, value: number) => {
    setScenarios((prev) =>
      prev.map((s) =>
        s.id === activeScenarioId
          ? { ...s, variables: { ...s.variables, [key]: value } }
          : s
      )
    );
  }, [activeScenarioId]);

  const updateName = useCallback((name: string) => {
    setScenarios((prev) =>
      prev.map((s) => (s.id === activeScenarioId ? { ...s, name } : s))
    );
  }, [activeScenarioId]);

  const results: ScenarioResult[] = useMemo(
    () =>
      scenarios.map((s) => ({
        scenarioId: s.id,
        scenarioName: s.name,
        color: s.color,
        metrics: {
          annualRevenue: computeProjection(s.variables).reduce((sum, m) => sum + m.revenue, 0),
          annualProfit: computeProjection(s.variables).reduce((sum, m) => sum + m.profit, 0),
          avgMargin:
            computeProjection(s.variables).reduce((sum, m) => sum + m.margin, 0) / 12,
        },
        monthlyProjection: computeProjection(s.variables),
      })),
    [scenarios]
  );

  const comparisonData = useMemo(() => {
    const months = results[0]?.monthlyProjection.map((m) => m.month) || [];
    return months.map((month, i) => {
      const row: Record<string, unknown> = { month };
      results.forEach((r) => {
        row[`${r.scenarioName} Revenue`] = r.monthlyProjection[i]?.revenue || 0;
        row[`${r.scenarioName} Profit`] = r.monthlyProjection[i]?.profit || 0;
      });
      return row;
    });
  }, [results]);

  const comparisonMetrics = useMemo(
    () =>
      results.map((r) => ({
        key: `${r.scenarioName} Revenue`,
        label: `${r.scenarioName}`,
        field: `${r.scenarioName} Revenue`,
        aggregation: 'sum' as const,
        format: 'currency' as const,
        color: r.color,
      })),
    [results]
  );

  return (
    <div className={cn('grid gap-4 lg:grid-cols-[320px_1fr]', className)}>
      {/* Scenario Panel */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Scenarios</CardTitle>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={addScenario}>
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {scenarios.map((s) => (
              <div
                key={s.id}
                className={cn(
                  'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors',
                  s.id === activeScenarioId ? 'bg-accent' : 'hover:bg-accent/50'
                )}
                onClick={() => setActiveScenarioId(s.id)}
              >
                <div className="h-3 w-3 rounded-full flex-shrink-0" style={getColorDotStyle(s.color)} />
                <span className="text-sm font-medium flex-1 truncate">{s.name}</span>
                {s.isBaseline && <Badge variant="secondary" className="text-[9px]">Base</Badge>}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={(e) => { e.stopPropagation(); duplicateScenario(s.id); }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                {!s.isBaseline && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0 text-destructive"
                    onClick={(e) => { e.stopPropagation(); removeScenario(s.id); }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {activeScenario && (
          <Card>
            <CardHeader className="pb-3">
              <Input
                value={activeScenario.name}
                onChange={(e) => updateName(e.target.value)}
                className="text-sm font-semibold h-8"
              />
            </CardHeader>
            <CardContent className="space-y-4">
              {variables.map((v) => (
                <div key={v.key} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">{v.label}</Label>
                    <span className="text-xs font-mono text-muted-foreground">
                      {v.type === 'currency' && '$'}
                      {activeScenario.variables[v.key] ?? v.defaultValue}
                      {v.type === 'percentage' && '%'}
                    </span>
                  </div>
                  <Slider
                    value={[activeScenario.variables[v.key] ?? v.defaultValue]}
                    onValueChange={([val]) => updateVariable(v.key, val)}
                    min={v.min}
                    max={v.max}
                    step={v.step}
                    className="w-full"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {onSave && (
          <Button className="w-full gap-1" onClick={() => onSave(scenarios)}>
            Save Scenarios
          </Button>
        )}
      </div>

      {/* Results Panel */}
      <div className="space-y-4">
        {/* KPI Comparison */}
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((r) => (
            <Card key={r.scenarioId}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={getColorDotStyle(r.color)} />
                  <CardTitle className="text-xs font-semibold">{r.scenarioName}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Annual Revenue</span>
                  <CurrencyDisplay amount={r.metrics.annualRevenue} compact className="text-sm font-bold" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Annual Profit</span>
                  <CurrencyDisplay amount={r.metrics.annualProfit} compact className="text-sm font-bold" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Margin</span>
                  <span className={cn('text-sm font-bold', r.metrics.avgMargin >= 20 ? 'text-semantic-success' : r.metrics.avgMargin >= 0 ? 'text-semantic-warning' : 'text-destructive')}>
                    {r.metrics.avgMargin.toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator />

        {/* Revenue Comparison Chart */}
        <ReportChart
          title="Revenue Comparison"
          description="Monthly projected revenue across scenarios"
          chartType="line"
          data={comparisonData}
          metrics={comparisonMetrics}
          dimensionKey="month"
        />

        {/* Profit Comparison Chart */}
        <ReportChart
          title="Profit Comparison"
          description="Monthly projected profit across scenarios"
          chartType="area"
          data={comparisonData}
          metrics={results.map((r) => ({
            key: `${r.scenarioName} Profit`,
            label: r.scenarioName,
            field: `${r.scenarioName} Profit`,
            aggregation: 'sum' as const,
            format: 'currency' as const,
            color: r.color,
          }))}
          dimensionKey="month"
        />
      </div>
    </div>
  );
}
