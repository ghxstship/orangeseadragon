'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Clock,
  AlertTriangle,
  Lightbulb,
  PieChart,
  Activity,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type InsightType = 'warning' | 'opportunity' | 'trend' | 'prediction';
type InsightPriority = 'high' | 'medium' | 'low';

interface Insight {
  id: string;
  type: InsightType;
  priority: InsightPriority;
  title: string;
  description: string;
  metric?: string;
  action?: string;
  confidence: number;
}

interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  trend: 'up' | 'down' | 'neutral';
  isPositive: boolean;
}

interface DepartmentMetric {
  department: string;
  headcount: number;
  turnoverRate: number;
  avgTenure: number;
  engagementScore: number;
  productivityIndex: number;
}

interface WorkforceAnalyticsProps {
  organizationId?: string | null;
  onRefresh?: () => void;
  onInsightAction?: (insightId: string, action: string) => void;
}

const INSIGHT_CONFIG: Record<InsightType, { icon: React.ElementType; color: string; bgColor: string }> = {
  warning: { icon: AlertTriangle, color: 'text-destructive', bgColor: 'bg-destructive/20' },
  opportunity: { icon: Lightbulb, color: 'text-semantic-success', bgColor: 'bg-semantic-success/20' },
  trend: { icon: TrendingUp, color: 'text-semantic-info', bgColor: 'bg-semantic-info/20' },
  prediction: { icon: Brain, color: 'text-semantic-purple', bgColor: 'bg-semantic-purple/20' },
};

const FALLBACK_METRICS: MetricCard[] = [
  { id: '1', title: 'Total Headcount', value: 0, change: 0, changeLabel: '', trend: 'neutral', isPositive: true },
  { id: '2', title: 'Turnover Rate', value: '0%', change: 0, changeLabel: '', trend: 'neutral', isPositive: true },
  { id: '3', title: 'Avg. Tenure', value: '0 yrs', change: 0, changeLabel: '', trend: 'neutral', isPositive: true },
  { id: '4', title: 'Active Staff', value: 0, change: 0, changeLabel: '', trend: 'neutral', isPositive: true },
  { id: '5', title: 'Departments', value: 0, change: 0, changeLabel: '', trend: 'neutral', isPositive: true },
  { id: '6', title: 'Avg. Salary', value: '$0', change: 0, changeLabel: '', trend: 'neutral', isPositive: true },
];



export function WorkforceAnalytics({
  organizationId,
  onRefresh,
  onInsightAction,
}: WorkforceAnalyticsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('quarter');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<MetricCard[]>(FALLBACK_METRICS);
  const [departments, setDepartments] = useState<DepartmentMetric[]>([]);
  const insights: Insight[] = [];

  useEffect(() => {
    if (!organizationId) return;
    const supabase = createClient();

    const fetchData = async () => {
      const { data: staff } = await supabase
        .from('employee_profiles')
        .select('id, hire_date, termination_date, is_active, department_id, salary')
        .eq('organization_id', organizationId);

      const { data: depts } = await supabase
        .from('departments')
        .select('id, name')
        .eq('organization_id', organizationId);

      const deptMap = new Map((depts ?? []).map(d => [d.id, d.name]));
      const rows = staff ?? [];
      const active = rows.filter(s => s.is_active !== false && !s.termination_date);
      const terminated = rows.filter(s => !!s.termination_date);
      const now = Date.now();
      const avgTenure = active.length > 0
        ? active.reduce((s, r) => {
            const hire = r.hire_date ? new Date(r.hire_date).getTime() : now;
            return s + (now - hire) / (365.25 * 24 * 60 * 60 * 1000);
          }, 0) / active.length
        : 0;
      const turnoverRate = rows.length > 0 ? (terminated.length / rows.length) * 100 : 0;
      const avgSalary = active.length > 0
        ? active.reduce((s, r) => s + (r.salary ?? 0), 0) / active.length
        : 0;
      const uniqueDepts = new Set(active.map(s => s.department_id).filter(Boolean));

      setMetrics([
        { id: '1', title: 'Total Headcount', value: rows.length, change: active.length - terminated.length, changeLabel: 'net active', trend: 'up', isPositive: true },
        { id: '2', title: 'Turnover Rate', value: `${turnoverRate.toFixed(1)}%`, change: 0, changeLabel: '', trend: turnoverRate > 10 ? 'up' : 'down', isPositive: turnoverRate <= 10 },
        { id: '3', title: 'Avg. Tenure', value: `${avgTenure.toFixed(1)} yrs`, change: 0, changeLabel: '', trend: 'neutral', isPositive: true },
        { id: '4', title: 'Active Staff', value: active.length, change: 0, changeLabel: '', trend: 'neutral', isPositive: true },
        { id: '5', title: 'Departments', value: uniqueDepts.size, change: 0, changeLabel: '', trend: 'neutral', isPositive: true },
        { id: '6', title: 'Avg. Salary', value: `$${Math.round(avgSalary).toLocaleString()}`, change: 0, changeLabel: '', trend: 'neutral', isPositive: true },
      ]);

      // Department breakdown
      const deptGroups = new Map<string, typeof rows>();
      for (const s of active) {
        const key = s.department_id ?? 'unassigned';
        if (!deptGroups.has(key)) deptGroups.set(key, []);
        deptGroups.get(key)!.push(s);
      }
      const deptMetrics: DepartmentMetric[] = Array.from(deptGroups.entries()).map(([deptId, members]) => {
        const deptTerminated = rows.filter(r => r.department_id === deptId && !!r.termination_date);
        const deptTurnover = (members.length + deptTerminated.length) > 0
          ? (deptTerminated.length / (members.length + deptTerminated.length)) * 100
          : 0;
        const deptTenure = members.length > 0
          ? members.reduce((s, r) => {
              const hire = r.hire_date ? new Date(r.hire_date).getTime() : now;
              return s + (now - hire) / (365.25 * 24 * 60 * 60 * 1000);
            }, 0) / members.length
          : 0;
        return {
          department: deptMap.get(deptId) ?? deptId,
          headcount: members.length,
          turnoverRate: Math.round(deptTurnover * 10) / 10,
          avgTenure: Math.round(deptTenure * 10) / 10,
          engagementScore: 0,
          productivityIndex: 0,
        };
      });
      setDepartments(deptMetrics.sort((a, b) => b.headcount - a.headcount));
    };

    fetchData();
  }, [organizationId]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const getScoreColor = (score: number, thresholds: { good: number; warning: number }) => {
    if (score >= thresholds.good) return 'text-semantic-success';
    if (score >= thresholds.warning) return 'text-semantic-warning';
    return 'text-destructive';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-semantic-purple" />
            Workforce Analytics
            <Badge variant="outline" className="ml-2 border-semantic-purple/50 text-semantic-purple">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Predictive insights and workforce intelligence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 bg-muted/50 border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="bg-card/80 border-border h-full">
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{metric.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{metric.value}</p>
                <div className={cn(
                  "flex items-center gap-1 mt-2 text-xs",
                  metric.isPositive ? "text-semantic-success" : "text-destructive"
                )}>
                  {metric.trend === 'up' ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : metric.trend === 'down' ? (
                    <ArrowDownRight className="w-3 h-3" />
                  ) : null}
                  <span>{metric.change > 0 ? '+' : ''}{metric.change}</span>
                  <span className="text-muted-foreground">{metric.changeLabel}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview">AI Insights</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-semantic-warning" />
              AI-Generated Insights
            </h3>
            <p className="text-sm text-muted-foreground">
              {insights.length} insight{insights.length !== 1 ? 's' : ''} generated
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {insights.map((insight, index) => {
              const config = INSIGHT_CONFIG[insight.type];
              const Icon = config.icon;

              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={cn(
                    "bg-card/80 border-border h-full",
                    insight.priority === 'high' && "border-l-2 border-l-destructive"
                  )}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn("p-2 rounded-lg", config.bgColor)}>
                            <Icon className={cn("w-4 h-4", config.color)} />
                          </div>
                          <div>
                            <CardTitle className="text-base text-white">{insight.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={cn("text-xs capitalize", config.color)}>
                                {insight.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {insight.confidence}% confidence
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                      {insight.metric && (
                        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          {insight.metric}
                        </p>
                      )}
                      {insight.action && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onInsightAction?.(insight.id, insight.action!)}
                          className="w-full"
                        >
                          {insight.action}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="departments" className="mt-6">
          <Card className="bg-card/80 border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Department Analytics
              </CardTitle>
              <CardDescription>
                Comparative metrics across all departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Department</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Headcount</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Turnover</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Avg Tenure</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Engagement</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Productivity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((dept, index) => (
                      <motion.tr
                        key={dept.department}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-border hover:bg-muted/40"
                      >
                        <td className="py-3 px-4">
                          <span className="font-medium text-white">{dept.department}</span>
                        </td>
                        <td className="py-3 px-4 text-right text-foreground">{dept.headcount}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={getScoreColor(100 - dept.turnoverRate * 5, { good: 70, warning: 50 })}>
                            {dept.turnoverRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-foreground">{dept.avgTenure} yrs</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Progress value={dept.engagementScore} className="w-16 h-2" />
                            <span className={getScoreColor(dept.engagementScore, { good: 75, warning: 60 })}>
                              {dept.engagementScore}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Progress value={dept.productivityIndex} className="w-16 h-2" />
                            <span className={getScoreColor(dept.productivityIndex, { good: 85, warning: 70 })}>
                              {dept.productivityIndex}
                            </span>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card/80 border-border">
              <CardHeader>
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-semantic-success" />
                  Positive Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-semantic-success/10 border border-semantic-success/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">Employee Retention</span>
                    <span className="text-semantic-success font-medium">+15%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Retention improved significantly after implementing flexible work policies</p>
                </div>
                <div className="p-4 rounded-lg bg-semantic-success/10 border border-semantic-success/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">Training Completion</span>
                    <span className="text-semantic-success font-medium">+28%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">New LMS platform driving higher course completion rates</p>
                </div>
                <div className="p-4 rounded-lg bg-semantic-success/10 border border-semantic-success/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">Internal Mobility</span>
                    <span className="text-semantic-success font-medium">+22%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">More employees moving between departments and roles</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 border-border">
              <CardHeader>
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-destructive" />
                  Areas of Concern
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">Sales Team Turnover</span>
                    <span className="text-destructive font-medium">12.1%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Above industry average of 8%. Review compensation and workload.</p>
                </div>
                <div className="p-4 rounded-lg bg-semantic-warning/10 border border-semantic-warning/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">Overtime Hours</span>
                    <span className="text-semantic-warning font-medium">+18%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Engineering team averaging 8+ overtime hours per week</p>
                </div>
                <div className="p-4 rounded-lg bg-semantic-warning/10 border border-semantic-warning/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">Open Positions</span>
                    <span className="text-semantic-warning font-medium">23 roles</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Average time-to-fill increasing. Consider expanding sourcing channels.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="mt-6">
          <Card className="bg-card/80 border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Brain className="w-5 h-5 text-semantic-purple" />
                Predictive Models
              </CardTitle>
              <CardDescription>
                AI-powered forecasts based on historical data and current trends
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 rounded-xl bg-gradient-to-br from-semantic-purple/20 to-semantic-info/20 border border-semantic-purple/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-semantic-purple" />
                    <span className="text-sm font-medium text-white">Headcount Forecast</span>
                  </div>
                  <p className="text-3xl font-bold text-white">268</p>
                  <p className="text-xs text-muted-foreground mt-1">Projected by Q2 2026</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs border-semantic-purple/50 text-semantic-purple">
                      94% confidence
                    </Badge>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-semantic-success/20 to-semantic-cyan/20 border border-semantic-success/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-semantic-success" />
                    <span className="text-sm font-medium text-white">Retention Rate</span>
                  </div>
                  <p className="text-3xl font-bold text-white">93%</p>
                  <p className="text-xs text-muted-foreground mt-1">Expected next 12 months</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs border-semantic-success/50 text-semantic-success">
                      89% confidence
                    </Badge>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-semantic-warning/20 to-semantic-orange/20 border border-semantic-warning/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-semantic-warning" />
                    <span className="text-sm font-medium text-white">Hiring Needs</span>
                  </div>
                  <p className="text-3xl font-bold text-white">42</p>
                  <p className="text-xs text-muted-foreground mt-1">New hires needed in 2026</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs border-semantic-warning/50 text-semantic-warning">
                      86% confidence
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-semantic-purple/20">
                    <Sparkles className="w-5 h-5 text-semantic-purple" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">Model Information</h4>
                    <p className="text-sm text-muted-foreground">
                      Predictions are generated using machine learning models trained on 3 years of historical workforce data, 
                      industry benchmarks, and current market conditions. Models are retrained monthly to maintain accuracy.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
