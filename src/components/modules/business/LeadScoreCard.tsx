'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Flame, Thermometer, Snowflake, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface LeadScoreCardProps {
    contactId: string;
    variant?: 'full' | 'compact' | 'badge';
    className?: string;
}

interface LeadScore {
    score: number;
    score_label: 'hot' | 'warm' | 'cold' | 'unscored';
    trend_direction: 'up' | 'down' | 'stable';
    score_change: number;
    factor_scores: Record<string, { score: number; factors: string[] }>;
    calculated_at: string;
}

const scoreConfig = {
    hot: {
        icon: Flame,
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        borderColor: 'border-destructive/30',
        label: 'Hot Lead',
        progressColor: '[&>div]:bg-destructive',
    },
    warm: {
        icon: Thermometer,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        label: 'Warm Lead',
        progressColor: '[&>div]:bg-orange-500',
    },
    cold: {
        icon: Snowflake,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        label: 'Cold Lead',
        progressColor: '[&>div]:bg-blue-500',
    },
    unscored: {
        icon: Sparkles,
        color: 'text-gray-400',
        bgColor: 'bg-gray-500/10',
        borderColor: 'border-gray-500/30',
        label: 'Unscored',
        progressColor: '[&>div]:bg-gray-400',
    },
};

function TrendIndicator({ direction, change }: { direction: string; change: number }) {
    if (direction === 'up') {
        return (
            <div className="flex items-center gap-1 text-semantic-success">
                <TrendingUp className="w-3 h-3" />
                <span className="text-xs font-medium">+{change}</span>
            </div>
        );
    }
    if (direction === 'down') {
        return (
            <div className="flex items-center gap-1 text-destructive">
                <TrendingDown className="w-3 h-3" />
                <span className="text-xs font-medium">{change}</span>
            </div>
        );
    }
    return (
        <div className="flex items-center gap-1 text-muted-foreground">
            <Minus className="w-3 h-3" />
            <span className="text-xs">Stable</span>
        </div>
    );
}

function ScoreBadge({ score }: { score: LeadScore }) {
    const config = scoreConfig[score.score_label] || scoreConfig.unscored;
    const Icon = config.icon;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge 
                        variant="outline" 
                        className={cn(
                            "gap-1 cursor-help",
                            config.bgColor,
                            config.borderColor,
                            config.color
                        )}
                    >
                        <Icon className="w-3 h-3" />
                        <span>{score.score}</span>
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <div className="text-xs">
                        <p className="font-medium">{config.label}</p>
                        <p className="text-muted-foreground">
                            Score: {score.score}/100
                        </p>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

function CompactScore({ score }: { score: LeadScore }) {
    const config = scoreConfig[score.score_label] || scoreConfig.unscored;
    const Icon = config.icon;

    return (
        <div className={cn(
            "flex items-center gap-2 p-2 rounded-lg border",
            config.bgColor,
            config.borderColor
        )}>
            <div className={cn("p-1.5 rounded-full", config.bgColor)}>
                <Icon className={cn("w-4 h-4", config.color)} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{score.score}</span>
                    <TrendIndicator direction={score.trend_direction} change={score.score_change} />
                </div>
                <Progress 
                    value={score.score} 
                    className={cn("h-1 mt-1", config.progressColor)}
                />
            </div>
        </div>
    );
}

function FullScore({ score }: { score: LeadScore }) {
    const config = scoreConfig[score.score_label] || scoreConfig.unscored;
    const Icon = config.icon;

    return (
        <Card className={cn("border", config.borderColor)}>
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className={cn("p-2 rounded-lg", config.bgColor)}>
                            <Icon className={cn("w-5 h-5", config.color)} />
                        </div>
                        <div>
                            <p className="text-sm font-medium">{config.label}</p>
                            <p className="text-xs text-muted-foreground">Lead Score</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold">{score.score}</p>
                        <TrendIndicator direction={score.trend_direction} change={score.score_change} />
                    </div>
                </div>

                <Progress 
                    value={score.score} 
                    className={cn("h-2 mb-3", config.progressColor)}
                />

                {/* Factor breakdown */}
                {Object.keys(score.factor_scores || {}).length > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                        <p className="text-xs font-medium text-muted-foreground uppercase">Score Factors</p>
                        {Object.entries(score.factor_scores).map(([category, data]) => (
                            <div key={category} className="flex items-center justify-between text-sm">
                                <span className="capitalize">{category.replace('_', ' ')}</span>
                                <span className="font-medium">+{data.score}</span>
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-[10px] text-muted-foreground mt-3">
                    Last updated: {new Date(score.calculated_at).toLocaleDateString()}
                </p>
            </CardContent>
        </Card>
    );
}

export function LeadScoreCard({ contactId, variant = 'compact', className }: LeadScoreCardProps) {
    const { data, isLoading } = useQuery({
        queryKey: ['lead-score', contactId],
        queryFn: async () => {
            const res = await fetch(`/api/contacts/${contactId}/score`);
            if (!res.ok) {
                if (res.status === 404) return null;
                throw new Error('Failed to load score');
            }
            return res.json() as Promise<LeadScore>;
        },
        enabled: !!contactId,
    });

    if (isLoading) {
        if (variant === 'badge') {
            return <Skeleton className="h-5 w-12" />;
        }
        return <Skeleton className={cn("h-20", className)} />;
    }

    if (!data) {
        // No score yet
        const defaultScore: LeadScore = {
            score: 0,
            score_label: 'unscored',
            trend_direction: 'stable',
            score_change: 0,
            factor_scores: {},
            calculated_at: new Date().toISOString(),
        };

        if (variant === 'badge') {
            return <ScoreBadge score={defaultScore} />;
        }
        if (variant === 'compact') {
            return <CompactScore score={defaultScore} />;
        }
        return <FullScore score={defaultScore} />;
    }

    if (variant === 'badge') {
        return <ScoreBadge score={data} />;
    }

    if (variant === 'compact') {
        return (
            <div className={className}>
                <CompactScore score={data} />
            </div>
        );
    }

    return (
        <div className={className}>
            <FullScore score={data} />
        </div>
    );
}

export default LeadScoreCard;
