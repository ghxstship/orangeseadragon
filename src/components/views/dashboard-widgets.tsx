"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface MetricWidgetProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
    label?: string;
  };
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function MetricWidget({
  title,
  value,
  description,
  trend,
  icon,
  className,
  onClick,
}: MetricWidgetProps) {
  return (
    <Card
      className={cn("cursor-pointer hover:shadow-md transition-shadow", className)}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <span
                className={cn(
                  "flex items-center text-xs font-medium",
                  trend.direction === "up" && "text-green-600",
                  trend.direction === "down" && "text-red-600",
                  trend.direction === "neutral" && "text-muted-foreground"
                )}
              >
                {trend.direction === "up" && <TrendingUp className="h-3 w-3 mr-1" />}
                {trend.direction === "down" && <TrendingDown className="h-3 w-3 mr-1" />}
                {trend.direction === "neutral" && <Minus className="h-3 w-3 mr-1" />}
                {trend.value > 0 ? "+" : ""}
                {trend.value}%
                {trend.label && <span className="ml-1 text-muted-foreground">{trend.label}</span>}
              </span>
            )}
            {description && (
              <span className="text-xs text-muted-foreground">{description}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export interface ProgressWidgetProps {
  title: string;
  value: number;
  max?: number;
  description?: string;
  status?: "default" | "success" | "warning" | "danger";
  showPercentage?: boolean;
  className?: string;
}

export function ProgressWidget({
  title,
  value,
  max = 100,
  description,
  status = "default",
  showPercentage = true,
  className,
}: ProgressWidgetProps) {
  const percentage = Math.round((value / max) * 100);

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "danger":
        return "bg-red-500";
      default:
        return "bg-primary";
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {showPercentage && (
            <span className="text-sm font-medium">{percentage}%</span>
          )}
        </div>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <Progress value={percentage} className={cn("h-2", getStatusColor())} />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{value.toLocaleString()}</span>
          <span>{max.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export interface DashboardListItem {
  id: string;
  label: string;
  value: string | number;
  subLabel?: string;
  trend?: "up" | "down" | "neutral";
  badge?: { label: string; variant?: "default" | "secondary" | "destructive" | "outline" };
  icon?: React.ReactNode;
}

export interface ListWidgetProps {
  title: string;
  items: DashboardListItem[];
  description?: string;
  maxItems?: number;
  onItemClick?: (item: DashboardListItem) => void;
  onViewAll?: () => void;
  className?: string;
}

export function ListWidget({
  title,
  items,
  description,
  maxItems = 5,
  onItemClick,
  onViewAll,
  className,
}: ListWidgetProps) {
  const displayItems = items.slice(0, maxItems);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {description && (
              <CardDescription className="text-xs">{description}</CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onViewAll}>View All</DropdownMenuItem>
              <DropdownMenuItem>Export</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {displayItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center justify-between px-4 py-3",
                onItemClick && "cursor-pointer hover:bg-muted/50 transition-colors"
              )}
              onClick={() => onItemClick?.(item)}
            >
              <div className="flex items-center gap-3 min-w-0">
                {item.icon && (
                  <div className="flex-shrink-0 text-muted-foreground">{item.icon}</div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{item.label}</p>
                  {item.subLabel && (
                    <p className="text-xs text-muted-foreground truncate">{item.subLabel}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {item.badge && (
                  <Badge variant={item.badge.variant || "secondary"} className="text-xs">
                    {item.badge.label}
                  </Badge>
                )}
                <span className="text-sm font-medium flex items-center gap-1">
                  {item.trend === "up" && <ArrowUpRight className="h-3 w-3 text-green-500" />}
                  {item.trend === "down" && <ArrowDownRight className="h-3 w-3 text-red-500" />}
                  {item.value}
                </span>
              </div>
            </div>
          ))}
        </div>
        {items.length > maxItems && onViewAll && (
          <div className="p-3 border-t">
            <Button variant="ghost" size="sm" className="w-full" onClick={onViewAll}>
              View All ({items.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface DonutWidgetProps {
  title: string;
  data: ChartDataPoint[];
  centerLabel?: string;
  centerValue?: string | number;
  description?: string;
  className?: string;
}

export function DonutWidget({
  title,
  data,
  centerLabel,
  centerValue,
  description,
  className,
}: DonutWidgetProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const defaultColors = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
  ];

  let currentAngle = 0;
  const segments = data.map((d, i) => {
    const angle = (d.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    return {
      ...d,
      startAngle,
      angle,
      color: d.color || defaultColors[i % defaultColors.length],
    };
  });

  const createArcPath = (startAngle: number, angle: number, radius: number, innerRadius: number) => {
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((startAngle + angle - 90) * Math.PI) / 180;

    const x1 = 50 + radius * Math.cos(startRad);
    const y1 = 50 + radius * Math.sin(startRad);
    const x2 = 50 + radius * Math.cos(endRad);
    const y2 = 50 + radius * Math.sin(endRad);

    const x3 = 50 + innerRadius * Math.cos(endRad);
    const y3 = 50 + innerRadius * Math.sin(endRad);
    const x4 = 50 + innerRadius * Math.cos(startRad);
    const y4 = 50 + innerRadius * Math.sin(startRad);

    const largeArc = angle > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {segments.map((segment, i) => (
                <path
                  key={i}
                  d={createArcPath(segment.startAngle, segment.angle, 45, 30)}
                  fill={segment.color}
                  className="transition-opacity hover:opacity-80"
                />
              ))}
            </svg>
            {(centerLabel || centerValue) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {centerValue && (
                  <span className="text-xl font-bold">{centerValue}</span>
                )}
                {centerLabel && (
                  <span className="text-xs text-muted-foreground">{centerLabel}</span>
                )}
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            {data.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: d.color || defaultColors[i % defaultColors.length] }}
                  />
                  <span className="text-muted-foreground">{d.label}</span>
                </div>
                <span className="font-medium">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export interface SparklineWidgetProps {
  title: string;
  value: string | number;
  data: number[];
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
  };
  color?: string;
  className?: string;
}

export function SparklineWidget({
  title,
  value,
  data,
  trend,
  color = "hsl(var(--primary))",
  className,
}: SparklineWidgetProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((v - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-2xl font-bold">{value}</div>
            {trend && (
              <span
                className={cn(
                  "flex items-center text-xs font-medium mt-1",
                  trend.direction === "up" && "text-green-600",
                  trend.direction === "down" && "text-red-600",
                  trend.direction === "neutral" && "text-muted-foreground"
                )}
              >
                {trend.direction === "up" && <TrendingUp className="h-3 w-3 mr-1" />}
                {trend.direction === "down" && <TrendingDown className="h-3 w-3 mr-1" />}
                {trend.value > 0 ? "+" : ""}
                {trend.value}%
              </span>
            )}
          </div>
          <div className="w-24 h-12">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
