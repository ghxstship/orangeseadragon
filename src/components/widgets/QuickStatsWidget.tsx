import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface QuickStatsWidgetProps {
  title?: string;
  stats?: Array<{
    label: string;
    value: number | string;
    trend?: 'up' | 'down' | 'neutral';
  }>;
}

export function QuickStatsWidget({ title = "Quick Stats", stats }: QuickStatsWidgetProps) {
  // Default stats if none provided
  const defaultStats = [
    { label: 'Active Events', value: 3, trend: 'up' as const },
    { label: 'Team Members', value: 12, trend: 'neutral' as const },
    { label: 'Tasks Completed', value: 24, trend: 'up' as const },
  ];

  const displayStats = stats || defaultStats;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {displayStats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
              {stat.trend && (
                <Badge
                  variant={stat.trend === 'up' ? 'default' : stat.trend === 'down' ? 'destructive' : 'secondary'}
                  className="mt-1 text-xs"
                >
                  {stat.trend === 'up' ? '↗' : stat.trend === 'down' ? '↘' : '→'}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
