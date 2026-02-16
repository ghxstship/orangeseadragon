'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';

const CHART_TOOLTIP_CONTENT_STYLE = {
    backgroundColor: 'hsl(var(--chart-tooltip-bg) / 0.8)',
    borderColor: 'hsl(var(--chart-tooltip-border))',
    borderRadius: '8px',
};

const CHART_TOOLTIP_ITEM_STYLE = {
    color: 'hsl(var(--chart-tooltip-text))',
};

const data = [
    { name: 'Jan', income: 40000, expense: 24000 },
    { name: 'Feb', income: 30000, expense: 13980 },
    { name: 'Mar', income: 20000, expense: 58000 },
    { name: 'Apr', income: 27800, expense: 39080 },
    { name: 'May', income: 18900, expense: 48000 },
    { name: 'Jun', income: 23900, expense: 38000 },
    { name: 'Jul', income: 34900, expense: 43000 },
    { name: 'Aug', income: 42000, expense: 32000 },
    { name: 'Sep', income: 45000, expense: 35000 },
    { name: 'Oct', income: 55000, expense: 30000 },
    { name: 'Nov', income: 48000, expense: 38000 },
    { name: 'Dec', income: 60000, expense: 45000 },
];

export function CashFlowChart() {
    const [timeRange, setTimeRange] = useState('12m');

    return (
        <Card className="col-span-4 h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle>Cash Flow</CardTitle>
                    <CardDescription>Income vs Expenses</CardDescription>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="6m">Last 6 Months</SelectItem>
                        <SelectItem value="12m">Last Year</SelectItem>
                        <SelectItem value="ytd">YTD</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="px-2 pb-4">
                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--chart-income))" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="hsl(var(--chart-income))" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--chart-expense))" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="hsl(var(--chart-expense))" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="name"
                                stroke="hsl(var(--chart-axis))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="hsl(var(--chart-axis))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value / 1000}k`}
                            />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--chart-grid) / 0.05)" />
                            <Tooltip
                                contentStyle={CHART_TOOLTIP_CONTENT_STYLE}
                                itemStyle={CHART_TOOLTIP_ITEM_STYLE}
                                formatter={(value: number) => [formatCurrency(value), '']}
                            />
                            <Area
                                type="monotone"
                                dataKey="income"
                                stroke="hsl(var(--chart-income))"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorIncome)"
                                name="Income"
                            />
                            <Area
                                type="monotone"
                                dataKey="expense"
                                stroke="hsl(var(--chart-expense))"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorExpense)"
                                name="Expenses"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
