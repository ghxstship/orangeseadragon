'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { DEFAULT_LOCALE } from '@/lib/config';
import { TrendingUp, TrendingDown, Target, DollarSign, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ForecastDashboardProps {
    pipelineId?: string;
    periodType?: 'monthly' | 'quarterly' | 'annual';
    className?: string;
}

interface ForecastData {
    totalPipelineValue: number;
    weightedValue: number;
    dealCount: number;
    bestCase: number;
    mostLikely: number;
    worstCase: number;
    quotaTarget: number;
    quotaAttainment: number;
    wonThisPeriod: number;
    trend: {
        date: string;
        value: number;
    }[];
    byOwner: {
        ownerId: string;
        ownerName: string;
        value: number;
        weightedValue: number;
        dealCount: number;
        quota?: number;
        attainment?: number;
    }[];
}

const currencyFormatter = new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
});

function ForecastCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    variant = 'default',
}: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    trend?: { direction: 'up' | 'down' | 'neutral'; value: string };
    variant?: 'default' | 'success' | 'warning' | 'primary';
}) {
    const variantStyles = {
        default: '',
        success: 'border-semantic-success/30',
        warning: 'border-semantic-warning/30',
        primary: 'border-primary/50',
    };

    return (
        <Card className={cn('', variantStyles[variant])}>
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {title}
                        </p>
                        <p className="text-2xl font-bold mt-1">{value}</p>
                        {subtitle && (
                            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
                        )}
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                </div>
                {trend && (
                    <div className="flex items-center gap-1 mt-2">
                        {trend.direction === 'up' && <TrendingUp className="w-3 h-3 text-semantic-success" />}
                        {trend.direction === 'down' && <TrendingDown className="w-3 h-3 text-destructive" />}
                        <span className={cn(
                            "text-xs font-medium",
                            trend.direction === 'up' && "text-semantic-success",
                            trend.direction === 'down' && "text-destructive"
                        )}>
                            {trend.value}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function QuotaProgress({ 
    current, 
    target, 
    label 
}: { 
    current: number; 
    target: number; 
    label: string;
}) {
    const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    const isOnTrack = percentage >= 75;
    const isAtRisk = percentage < 50;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{label}</span>
                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                        {currencyFormatter.format(current)} / {currencyFormatter.format(target)}
                    </span>
                    <Badge 
                        variant={isOnTrack ? 'default' : isAtRisk ? 'destructive' : 'secondary'}
                        className="text-xs"
                    >
                        {percentage.toFixed(0)}%
                    </Badge>
                </div>
            </div>
            <Progress 
                value={percentage} 
                className={cn(
                    "h-2",
                    isOnTrack && "[&>div]:bg-semantic-success",
                    isAtRisk && "[&>div]:bg-destructive"
                )}
            />
        </div>
    );
}

function ForecastScenarios({
    bestCase,
    mostLikely,
    worstCase,
}: {
    bestCase: number;
    mostLikely: number;
    worstCase: number;
}) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Forecast Scenarios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-semantic-success" />
                        <span className="text-sm">Best Case</span>
                    </div>
                    <span className="font-semibold">{currencyFormatter.format(bestCase)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-semantic-info" />
                        <span className="text-sm">Most Likely</span>
                    </div>
                    <span className="font-semibold">{currencyFormatter.format(mostLikely)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-semantic-orange" />
                        <span className="text-sm">Worst Case</span>
                    </div>
                    <span className="font-semibold">{currencyFormatter.format(worstCase)}</span>
                </div>
                
                {/* Visual range */}
                <div className="pt-2">
                    <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                        <div 
                            className="absolute inset-y-0 inset-x-[10%] bg-gradient-to-r from-semantic-orange/30 via-semantic-info/50 to-semantic-success/30"
                        />
                        <div 
                            className="absolute top-1/2 left-1/2 -translate-y-1/2 w-1 h-4 bg-semantic-info rounded"
                        />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                        <span>Conservative</span>
                        <span>Optimistic</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function TeamLeaderboard({
    owners,
}: {
    owners: ForecastData['byOwner'];
}) {
    const sortedOwners = useMemo(() => {
        return [...owners].sort((a, b) => b.weightedValue - a.weightedValue);
    }, [owners]);

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Team Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {sortedOwners.slice(0, 5).map((owner, index) => (
                        <div key={owner.ownerId} className="flex items-center gap-3">
                            <span className="text-xs font-medium text-muted-foreground w-4">
                                {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {owner.ownerName || 'Unassigned'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {owner.dealCount} deals
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold">
                                    {currencyFormatter.format(owner.weightedValue)}
                                </p>
                                {owner.attainment !== undefined && (
                                    <Badge 
                                        variant={owner.attainment >= 100 ? 'default' : 'secondary'}
                                        className="text-[10px]"
                                    >
                                        {owner.attainment}% quota
                                    </Badge>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export function ForecastDashboard({ 
    pipelineId, 
    periodType = 'quarterly',
    className 
}: ForecastDashboardProps) {
    const { data, isLoading } = useQuery({
        queryKey: ['forecast', pipelineId, periodType],
        queryFn: async () => {
            const params = new URLSearchParams({ period_type: periodType });
            if (pipelineId) params.set('pipeline_id', pipelineId);
            
            const res = await fetch(`/api/forecast?${params}`);
            if (!res.ok) throw new Error('Failed to load forecast');
            return res.json() as Promise<ForecastData>;
        },
    });

    if (isLoading) {
        return (
            <div className={cn("space-y-4", className)}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-24" />
                    ))}
                </div>
            </div>
        );
    }

    const forecast = data || {
        totalPipelineValue: 0,
        weightedValue: 0,
        dealCount: 0,
        bestCase: 0,
        mostLikely: 0,
        worstCase: 0,
        quotaTarget: 0,
        quotaAttainment: 0,
        wonThisPeriod: 0,
        trend: [],
        byOwner: [],
    };

    const periodLabel = periodType === 'monthly' ? 'This Month' : 
                        periodType === 'quarterly' ? 'This Quarter' : 'This Year';

    return (
        <div className={cn("space-y-6", className)}>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ForecastCard
                    title="Pipeline Value"
                    value={currencyFormatter.format(forecast.totalPipelineValue)}
                    subtitle={`${forecast.dealCount} active deals`}
                    icon={DollarSign}
                />
                <ForecastCard
                    title="Weighted Forecast"
                    value={currencyFormatter.format(forecast.weightedValue)}
                    subtitle="Probability-adjusted"
                    icon={Target}
                    variant="primary"
                />
                <ForecastCard
                    title={`Won ${periodLabel}`}
                    value={currencyFormatter.format(forecast.wonThisPeriod)}
                    subtitle="Closed revenue"
                    icon={TrendingUp}
                    variant="success"
                />
                <ForecastCard
                    title="Period"
                    value={periodLabel}
                    subtitle={periodType.charAt(0).toUpperCase() + periodType.slice(1)}
                    icon={Calendar}
                />
            </div>

            {/* Quota Progress */}
            {forecast.quotaTarget > 0 && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Quota Attainment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <QuotaProgress
                            current={forecast.wonThisPeriod}
                            target={forecast.quotaTarget}
                            label={periodLabel}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Scenarios and Leaderboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ForecastScenarios
                    bestCase={forecast.bestCase}
                    mostLikely={forecast.mostLikely}
                    worstCase={forecast.worstCase}
                />
                {forecast.byOwner.length > 0 && (
                    <TeamLeaderboard owners={forecast.byOwner} />
                )}
            </div>
        </div>
    );
}

export default ForecastDashboard;
