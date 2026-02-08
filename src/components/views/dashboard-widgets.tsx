"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { motion, AnimatePresence } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="h-full"
    >
      <Card
        className={cn("h-full cursor-pointer border-border glass-morphism overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-primary/10", className)}
        onClick={onClick}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-background/5">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-60">
            {title}
          </CardTitle>
          {icon && <div className="text-primary/60 shadow-[0_0_10px_rgba(var(--primary),0.3)]">{icon}</div>}
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-3xl font-black tracking-tight">{value}</div>
          {(description || trend) && (
            <div className="flex items-center gap-2 mt-3">
              {trend && (
                <span
                  className={cn(
                    "flex items-center text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                    trend.direction === "up" && "text-green-400 border-green-500/20 bg-green-500/10 shadow-[0_0_8px_rgba(34,197,94,0.2)]",
                    trend.direction === "down" && "text-red-400 border-red-500/20 bg-red-500/10 shadow-[0_0_8px_rgba(239,68,68,0.2)]",
                    trend.direction === "neutral" && "text-muted-foreground border-border bg-muted"
                  )}
                >
                  {trend.direction === "up" && <TrendingUp className="h-3 w-3 mr-1" />}
                  {trend.direction === "down" && <TrendingDown className="h-3 w-3 mr-1" />}
                  {trend.direction === "neutral" && <Minus className="h-3 w-3 mr-1" />}
                  {trend.value > 0 ? "+" : ""}
                  {trend.value}%
                </span>
              )}
              {description && (
                <span className="text-[10px] font-bold uppercase tracking-tight opacity-40">{description}</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full"
    >
      <Card className={cn("h-full border-border glass-morphism overflow-hidden shadow-2xl", className)}>
        <CardHeader className="pb-4 border-b border-border bg-background/5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{title}</CardTitle>
            {showPercentage && (
              <span className="text-[10px] font-black text-primary shadow-sm">{percentage}%</span>
            )}
          </div>
          {description && (
            <CardDescription className="text-[9px] font-bold uppercase opacity-30 mt-1">{description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="pt-6">
          <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden border border-border">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={cn("absolute top-0 bottom-0 rounded-full shadow-[0_0_10px_rgba(var(--primary),0.3)]", getStatusColor())}
            />
          </div>
          <div className="flex justify-between mt-3 text-[9px] font-black uppercase tracking-widest opacity-40">
            <span>{value.toLocaleString()}</span>
            <span>{max.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
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
    <Card className={cn("border-border glass-morphism overflow-hidden shadow-2xl", className)}>
      <CardHeader className="pb-3 border-b border-border bg-background/5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{title}</CardTitle>
            {description && (
              <CardDescription className="text-[9px] font-bold uppercase opacity-30 mt-1">{description}</CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent rounded-full">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-morphism border-border">
              <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-wider" onClick={onViewAll}>View All</DropdownMenuItem>
              <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-wider">Export</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          <AnimatePresence mode="popLayout">
            {displayItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.03)", x: 4 }}
                className={cn(
                  "flex items-center justify-between px-5 py-4 transition-all duration-300",
                  onItemClick && "cursor-pointer"
                )}
                onClick={() => onItemClick?.(item)}
              >
                <div className="flex items-center gap-4 min-w-0 font-medium">
                  {item.icon && (
                    <div className="flex-shrink-0 text-primary/60 group-hover:text-primary transition-colors">{item.icon}</div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-black tracking-tight truncate">{item.label}</p>
                    {item.subLabel && (
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-30 truncate mt-0.5">{item.subLabel}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {item.badge && (
                    <Badge variant={item.badge.variant || "secondary"} className="bg-muted border-border text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5">
                      {item.badge.label}
                    </Badge>
                  )}
                  <span className="text-sm font-black tracking-tight flex items-center gap-1.5">
                    {item.trend === "up" && <ArrowUpRight className="h-3 w-3 text-green-400" />}
                    {item.trend === "down" && <ArrowDownRight className="h-3 w-3 text-red-400" />}
                    {item.value}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {items.length > maxItems && onViewAll && (
          <div className="p-3 border-t border-border bg-background/5">
            <Button variant="ghost" size="sm" className="w-full text-[10px] font-black uppercase tracking-widest hover:bg-muted" onClick={onViewAll}>
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
  onSegmentClick?: (segment: ChartDataPoint) => void;
}

export function DonutWidget({
  title,
  data,
  centerLabel,
  centerValue,
  description,
  className,
  onSegmentClick,
}: DonutWidgetProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const defaultColors = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--chart-income))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-expense))",
    "hsl(var(--chart-5))",
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
    <Card className={cn("border-border glass-morphism overflow-hidden shadow-2xl", className)}>
      <CardHeader className="pb-4 border-b border-border bg-background/5">
        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{title}</CardTitle>
        {description && (
          <CardDescription className="text-[9px] font-bold uppercase opacity-30 mt-1">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex items-center gap-8">
          <div className="relative w-40 h-40 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 filter drop-shadow-[0_0_8px_rgba(0,0,0,0.3)]">
              {segments.map((segment, i) => (
                <motion.path
                  key={i}
                  initial={{ strokeDasharray: "0 1000", opacity: 0 }}
                  animate={{ strokeDasharray: "1000 1000", opacity: 1 }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  d={createArcPath(segment.startAngle, segment.angle, 45, 30)}
                  fill={segment.color}
                  className="transition-opacity hover:opacity-80 cursor-pointer"
                  onClick={() => onSegmentClick?.({ label: segment.label, value: segment.value, color: segment.color })}
                />
              ))}
            </svg>
            {(centerLabel || centerValue) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {centerValue && (
                  <span className="text-2xl font-black tracking-tight">{centerValue}</span>
                )}
                {centerLabel && (
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 mt-1">{centerLabel}</span>
                )}
              </div>
            )}
          </div>
          <div className="flex-1 space-y-3">
            {data.map((d, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center justify-between group",
                  onSegmentClick && "cursor-pointer"
                )}
                onClick={() => onSegmentClick?.(d)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.2)]"
                    style={{ backgroundColor: d.color || defaultColors[i % defaultColors.length] }}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 group-hover:opacity-100 transition-opacity">{d.label}</span>
                </div>
                <span className="text-[11px] font-black tracking-tighter">{d.value}</span>
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
    <Card className={cn("border-border glass-morphism overflow-hidden shadow-2xl", className)}>
      <CardHeader className="pb-4 border-b border-border bg-background/5">
        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="text-3xl font-black tracking-tight leading-none">{value}</div>
            {trend && (
              <span
                className={cn(
                  "flex items-center text-[10px] font-black uppercase tracking-wider mt-3 px-2 py-0.5 rounded-full border w-fit",
                  trend.direction === "up" && "text-green-400 border-green-500/20 bg-green-500/10 shadow-[0_0_8px_rgba(34,197,94,0.1)]",
                  trend.direction === "down" && "text-red-400 border-red-500/20 bg-red-500/10 shadow-[0_0_8px_rgba(239,68,68,0.1)]",
                  trend.direction === "neutral" && "text-muted-foreground border-border bg-muted"
                )}
              >
                {trend.direction === "up" && <TrendingUp className="h-2.5 w-2.5 mr-1" />}
                {trend.direction === "down" && <TrendingDown className="h-2.5 w-2.5 mr-1" />}
                {trend.value > 0 ? "+" : ""}
                {trend.value}%
              </span>
            )}
          </div>
          <div className="w-32 h-14">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id={`gradient-${title.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity="0.5" />
                  <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
              </defs>
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                d={`M ${points.split(' ').map((p, i) => i === 0 ? p : `L ${p}`).join(' ')}`}
                fill="none"
                stroke={color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_0_5px_rgba(var(--primary),0.5)]"
              />
              <motion.path
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                d={`M ${points} L 100,100 L 0,100 Z`}
                fill={`url(#gradient-${title.replace(/\s+/g, '-')})`}
              />
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
