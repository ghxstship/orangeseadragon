'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, Activity, DollarSign, Wallet } from 'lucide-react';

interface MetricProps {
    title: string;
    value: string;
    change?: number;
    trend?: 'up' | 'down' | 'neutral';
    icon: React.ElementType;
    description?: string;
}

function MetricItem({ title, value, change, trend, icon: Icon, description }: MetricProps) {
    return (
        <div className="flex flex-col space-y-2 p-4 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors border border-transparent hover:border-border">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{title}</span>
                <div className="p-2 bg-background rounded-full">
                    <Icon className="h-4 w-4 text-primary" />
                </div>
            </div>
            <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold tracking-tight">{value}</span>
                {change !== undefined && (
                    <span className={`text-xs font-medium flex items-center ${trend === 'up' ? 'text-emerald-500 dark:text-emerald-400' : 'text-destructive'}`}>
                        {trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                        {Math.abs(change)}%
                    </span>
                )}
            </div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
    );
}

export function FinancialHealthCard() {
    return (
        <Card className="col-span-2 h-full">
            <CardHeader>
                <CardTitle>Financial Health</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
                <MetricItem
                    title="Total Revenue"
                    value="$124,500"
                    change={12.5}
                    trend="up"
                    icon={DollarSign}
                    description="vs. last month"
                />
                <MetricItem
                    title="OpEx Run Rate"
                    value="$45,200"
                    change={2.1}
                    trend="down"
                    icon={Activity}
                    description="Monthly burn"
                />
                <MetricItem
                    title="Net Profit Margin"
                    value="64%"
                    change={4.3}
                    trend="up"
                    icon={Wallet}
                    description="Healthy range (>50%)"
                />
            </CardContent>
        </Card>
    );
}
