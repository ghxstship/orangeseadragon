'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PipelineStatsProps {
    pipelineId?: string;
    className?: string;
}

interface DealStats {
    totalDeals: number;
    totalValue: number;
    weightedValue: number;
    rottingDeals: number;
    avgDaysInPipeline: number;
    byStage: {
        stage: string;
        count: number;
        value: number;
    }[];
    wonThisMonth: number;
    lostThisMonth: number;
    winRate: number;
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
});

function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    trendValue,
    variant = 'default',
}: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    variant?: 'default' | 'success' | 'warning' | 'danger';
}) {
    const variantStyles = {
        default: 'bg-background',
        success: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
        warning: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800',
        danger: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
    };

    const iconStyles = {
        default: 'text-primary',
        success: 'text-green-600',
        warning: 'text-yellow-600',
        danger: 'text-red-600',
    };

    return (
        <Card className={cn('border', variantStyles[variant])}>
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {title}
                        </p>
                        <p className="text-2xl font-bold mt-1">{value}</p>
                        {subtitle && (
                            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
                        )}
                        {trend && trendValue && (
                            <div className="flex items-center gap-1 mt-2">
                                {trend === 'up' && <TrendingUp className="w-3 h-3 text-green-600" />}
                                {trend === 'down' && <TrendingDown className="w-3 h-3 text-red-600" />}
                                <span className={cn(
                                    "text-xs font-medium",
                                    trend === 'up' && "text-green-600",
                                    trend === 'down' && "text-red-600",
                                    trend === 'neutral' && "text-muted-foreground"
                                )}>
                                    {trendValue}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className={cn("p-2 rounded-lg bg-muted/50", iconStyles[variant])}>
                        <Icon className="w-5 h-5" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function StageBreakdown({ stages }: { stages: DealStats['byStage'] }) {
    const maxValue = Math.max(...stages.map(s => s.value), 1);

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pipeline Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {stages.map((stage) => (
                    <div key={stage.stage} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-medium capitalize">{stage.stage.replace('-', ' ')}</span>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-[10px] h-5">
                                    {stage.count}
                                </Badge>
                                <span className="text-muted-foreground">
                                    {currencyFormatter.format(stage.value)}
                                </span>
                            </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary/70 rounded-full transition-all"
                                style={{ width: `${(stage.value / maxValue) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export function PipelineStats({ pipelineId, className }: PipelineStatsProps) {
    const { data, isLoading } = useQuery({
        queryKey: ['pipeline-stats', pipelineId],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (pipelineId) params.set('pipeline_id', pipelineId);
            
            const res = await fetch(`/api/deals/stats?${params}`);
            if (!res.ok) throw new Error('Failed to load stats');
            return res.json() as Promise<DealStats>;
        },
    });

    if (isLoading) {
        return (
            <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-24" />
                ))}
            </div>
        );
    }

    const stats = data || {
        totalDeals: 0,
        totalValue: 0,
        weightedValue: 0,
        rottingDeals: 0,
        avgDaysInPipeline: 0,
        byStage: [],
        wonThisMonth: 0,
        lostThisMonth: 0,
        winRate: 0,
    };

    return (
        <div className={cn("space-y-4", className)}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    title="Pipeline Value"
                    value={currencyFormatter.format(stats.totalValue)}
                    subtitle={`${stats.totalDeals} active deals`}
                    icon={DollarSign}
                />
                <StatCard
                    title="Weighted Value"
                    value={currencyFormatter.format(stats.weightedValue)}
                    subtitle="Probability-adjusted"
                    icon={Target}
                />
                <StatCard
                    title="Win Rate"
                    value={`${stats.winRate}%`}
                    subtitle={`${stats.wonThisMonth} won this month`}
                    icon={TrendingUp}
                    variant={stats.winRate >= 30 ? 'success' : stats.winRate >= 15 ? 'default' : 'warning'}
                />
                <StatCard
                    title="Needs Attention"
                    value={stats.rottingDeals}
                    subtitle="Deals with no recent activity"
                    icon={AlertTriangle}
                    variant={stats.rottingDeals > 5 ? 'danger' : stats.rottingDeals > 0 ? 'warning' : 'default'}
                />
            </div>

            {stats.byStage.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StageBreakdown stages={stats.byStage} />
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Avg. Days in Pipeline</span>
                                    <span className="text-sm font-medium">{stats.avgDaysInPipeline} days</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Won This Month</span>
                                    <Badge variant="outline" className="text-green-600 border-green-200">
                                        {stats.wonThisMonth}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Lost This Month</span>
                                    <Badge variant="outline" className="text-red-600 border-red-200">
                                        {stats.lostThisMonth}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default PipelineStats;
