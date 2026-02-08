'use client';

import { useState } from 'react';
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
  onRefresh?: () => void;
  onInsightAction?: (insightId: string, action: string) => void;
}

const INSIGHT_CONFIG: Record<InsightType, { icon: React.ElementType; color: string; bgColor: string }> = {
  warning: { icon: AlertTriangle, color: 'text-rose-400', bgColor: 'bg-rose-500/20' },
  opportunity: { icon: Lightbulb, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
  trend: { icon: TrendingUp, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  prediction: { icon: Brain, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
};

const MOCK_METRICS: MetricCard[] = [
  { id: '1', title: 'Total Headcount', value: 247, change: 12, changeLabel: 'vs last quarter', trend: 'up', isPositive: true },
  { id: '2', title: 'Turnover Rate', value: '8.2%', change: -2.1, changeLabel: 'vs last quarter', trend: 'down', isPositive: true },
  { id: '3', title: 'Avg. Tenure', value: '3.4 yrs', change: 0.3, changeLabel: 'vs last year', trend: 'up', isPositive: true },
  { id: '4', title: 'Engagement Score', value: 78, change: 5, changeLabel: 'vs last survey', trend: 'up', isPositive: true },
  { id: '5', title: 'Time to Hire', value: '32 days', change: -8, changeLabel: 'vs last quarter', trend: 'down', isPositive: true },
  { id: '6', title: 'Training Hours', value: '24.5 hrs', change: 6.2, changeLabel: 'per employee', trend: 'up', isPositive: true },
];

const MOCK_INSIGHTS: Insight[] = [
  { 
    id: '1', 
    type: 'warning', 
    priority: 'high',
    title: 'Elevated Attrition Risk in Engineering',
    description: 'Based on engagement scores and tenure patterns, 3 senior engineers show signs of potential departure within 90 days.',
    metric: '23% higher risk than baseline',
    action: 'Schedule retention conversations',
    confidence: 87
  },
  { 
    id: '2', 
    type: 'prediction', 
    priority: 'medium',
    title: 'Q2 Hiring Needs Forecast',
    description: 'Projected growth and planned departures suggest 15-18 new hires needed across Product and Engineering by end of Q2.',
    metric: 'Based on 94% accurate historical model',
    action: 'Review hiring pipeline',
    confidence: 94
  },
  { 
    id: '3', 
    type: 'opportunity', 
    priority: 'medium',
    title: 'Skills Gap in Data Analytics',
    description: 'Team capability analysis shows 40% gap in advanced analytics skills. Internal training could address 60% of this gap.',
    metric: '12 employees identified for upskilling',
    action: 'Launch training program',
    confidence: 82
  },
  { 
    id: '4', 
    type: 'trend', 
    priority: 'low',
    title: 'Remote Work Productivity Increase',
    description: 'Employees with hybrid schedules show 12% higher productivity scores compared to fully in-office counterparts.',
    metric: 'Consistent over 6 months',
    action: 'Expand hybrid policy',
    confidence: 91
  },
];

const MOCK_DEPARTMENTS: DepartmentMetric[] = [
  { department: 'Engineering', headcount: 82, turnoverRate: 6.5, avgTenure: 2.8, engagementScore: 76, productivityIndex: 92 },
  { department: 'Product', headcount: 24, turnoverRate: 4.2, avgTenure: 3.1, engagementScore: 82, productivityIndex: 88 },
  { department: 'Design', headcount: 18, turnoverRate: 8.3, avgTenure: 2.4, engagementScore: 79, productivityIndex: 85 },
  { department: 'Sales', headcount: 45, turnoverRate: 12.1, avgTenure: 1.9, engagementScore: 71, productivityIndex: 94 },
  { department: 'Operations', headcount: 38, turnoverRate: 5.8, avgTenure: 4.2, engagementScore: 74, productivityIndex: 87 },
  { department: 'Finance', headcount: 22, turnoverRate: 3.2, avgTenure: 5.1, engagementScore: 80, productivityIndex: 91 },
  { department: 'HR', headcount: 18, turnoverRate: 2.8, avgTenure: 4.8, engagementScore: 85, productivityIndex: 89 },
];

export function WorkforceAnalytics({
  onRefresh,
  onInsightAction,
}: WorkforceAnalyticsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('quarter');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const getScoreColor = (score: number, thresholds: { good: number; warning: number }) => {
    if (score >= thresholds.good) return 'text-emerald-400';
    if (score >= thresholds.warning) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            Workforce Analytics
            <Badge variant="outline" className="ml-2 border-purple-500/50 text-purple-400">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Predictive insights and workforce intelligence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 bg-zinc-800/50 border-white/10">
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
        {MOCK_METRICS.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="bg-zinc-900/60 border-white/10 h-full">
              <CardContent className="pt-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wide">{metric.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{metric.value}</p>
                <div className={cn(
                  "flex items-center gap-1 mt-2 text-xs",
                  metric.isPositive ? "text-emerald-400" : "text-rose-400"
                )}>
                  {metric.trend === 'up' ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : metric.trend === 'down' ? (
                    <ArrowDownRight className="w-3 h-3" />
                  ) : null}
                  <span>{metric.change > 0 ? '+' : ''}{metric.change}</span>
                  <span className="text-zinc-500">{metric.changeLabel}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-zinc-800/50">
          <TabsTrigger value="overview">AI Insights</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              AI-Generated Insights
            </h3>
            <p className="text-sm text-zinc-500">
              {MOCK_INSIGHTS.length} insights generated
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {MOCK_INSIGHTS.map((insight, index) => {
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
                    "bg-zinc-900/60 border-white/10 h-full",
                    insight.priority === 'high' && "border-l-2 border-l-rose-500"
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
                              <span className="text-xs text-zinc-500">
                                {insight.confidence}% confidence
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-zinc-400 mb-3">{insight.description}</p>
                      {insight.metric && (
                        <p className="text-xs text-zinc-500 mb-3 flex items-center gap-1">
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
          <Card className="bg-zinc-900/60 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-zinc-300 flex items-center gap-2">
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
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Department</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Headcount</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Turnover</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Avg Tenure</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Engagement</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Productivity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_DEPARTMENTS.map((dept, index) => (
                      <motion.tr
                        key={dept.department}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-white/5 hover:bg-zinc-800/30"
                      >
                        <td className="py-3 px-4">
                          <span className="font-medium text-white">{dept.department}</span>
                        </td>
                        <td className="py-3 px-4 text-right text-zinc-300">{dept.headcount}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={getScoreColor(100 - dept.turnoverRate * 5, { good: 70, warning: 50 })}>
                            {dept.turnoverRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-zinc-300">{dept.avgTenure} yrs</td>
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
            <Card className="bg-zinc-900/60 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg text-zinc-300 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Positive Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">Employee Retention</span>
                    <span className="text-emerald-400 font-medium">+15%</span>
                  </div>
                  <p className="text-xs text-zinc-500">Retention improved significantly after implementing flexible work policies</p>
                </div>
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">Training Completion</span>
                    <span className="text-emerald-400 font-medium">+28%</span>
                  </div>
                  <p className="text-xs text-zinc-500">New LMS platform driving higher course completion rates</p>
                </div>
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">Internal Mobility</span>
                    <span className="text-emerald-400 font-medium">+22%</span>
                  </div>
                  <p className="text-xs text-zinc-500">More employees moving between departments and roles</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/60 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg text-zinc-300 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-rose-400" />
                  Areas of Concern
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">Sales Team Turnover</span>
                    <span className="text-rose-400 font-medium">12.1%</span>
                  </div>
                  <p className="text-xs text-zinc-500">Above industry average of 8%. Review compensation and workload.</p>
                </div>
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">Overtime Hours</span>
                    <span className="text-amber-400 font-medium">+18%</span>
                  </div>
                  <p className="text-xs text-zinc-500">Engineering team averaging 8+ overtime hours per week</p>
                </div>
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">Open Positions</span>
                    <span className="text-amber-400 font-medium">23 roles</span>
                  </div>
                  <p className="text-xs text-zinc-500">Average time-to-fill increasing. Consider expanding sourcing channels.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="mt-6">
          <Card className="bg-zinc-900/60 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-zinc-300 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                Predictive Models
              </CardTitle>
              <CardDescription>
                AI-powered forecasts based on historical data and current trends
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-medium text-white">Headcount Forecast</span>
                  </div>
                  <p className="text-3xl font-bold text-white">268</p>
                  <p className="text-xs text-zinc-400 mt-1">Projected by Q2 2026</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-400">
                      94% confidence
                    </Badge>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-medium text-white">Retention Rate</span>
                  </div>
                  <p className="text-3xl font-bold text-white">93%</p>
                  <p className="text-xs text-zinc-400 mt-1">Expected next 12 months</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs border-emerald-500/50 text-emerald-400">
                      89% confidence
                    </Badge>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-medium text-white">Hiring Needs</span>
                  </div>
                  <p className="text-3xl font-bold text-white">42</p>
                  <p className="text-xs text-zinc-400 mt-1">New hires needed in 2026</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-400">
                      86% confidence
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-zinc-800/50 border border-white/5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">Model Information</h4>
                    <p className="text-sm text-zinc-400">
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
