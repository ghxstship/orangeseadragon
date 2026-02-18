'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, Activity, DollarSign, Wallet } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/hooks/auth/use-supabase';
import { useFinanceDashboard } from '@/hooks/data/finance/use-finance-dashboard';
import { formatCurrency } from '@/lib/utils';

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
                    <span className={`text-xs font-medium flex items-center ${trend === 'up' ? 'text-semantic-success' : 'text-destructive'}`}>
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
    const { user } = useUser();
    const orgId = user?.user_metadata?.organization_id || null;
    const financeDashboard = useFinanceDashboard(orgId);
    const summary = financeDashboard?.summary;
    const isLoading = Boolean(orgId) && !financeDashboard;

    return (
        <Card className="col-span-2 h-full">
            <CardHeader>
                <CardTitle>Financial Health</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
                {isLoading ? (
                    <>
                        <Skeleton className="h-[92px] w-full rounded-xl" />
                        <Skeleton className="h-[92px] w-full rounded-xl" />
                        <Skeleton className="h-[92px] w-full rounded-xl" />
                    </>
                ) : (
                    <>
                        <MetricItem
                            title="Total Revenue"
                            value={formatCurrency(summary?.mtdRevenue ?? 0)}
                            icon={DollarSign}
                            description="Month-to-date paid invoices"
                        />
                        <MetricItem
                            title="OpEx Run Rate"
                            value={formatCurrency(summary?.mtdExpenses ?? 0)}
                            icon={Activity}
                            description="Month-to-date tracked expenses"
                        />
                        <MetricItem
                            title="Net Profit Margin"
                            value={`${(summary?.marginPercent ?? 0).toFixed(1)}%`}
                            icon={Wallet}
                            description="Revenue minus expenses ratio (MTD)"
                        />
                    </>
                )}
            </CardContent>
        </Card>
    );
}
