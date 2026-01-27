"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  Volume2,
  MapPin,
  Clock,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";

interface NoiseMonitor {
  id: string;
  name: string;
  location: string;
  currentLevel: number;
  maxAllowed: number;
  peakLevel: number;
  peakTime: string;
  status: "normal" | "warning" | "exceeded";
  trend: "increasing" | "decreasing" | "stable";
  lastUpdated: string;
}

const noiseMonitors: NoiseMonitor[] = [
  {
    id: "1",
    name: "Main Stage - FOH",
    location: "Main Stage Front of House",
    currentLevel: 98,
    maxAllowed: 105,
    peakLevel: 103,
    peakTime: "2024-06-15T21:30:00",
    status: "normal",
    trend: "stable",
    lastUpdated: "2024-06-15T22:15:00",
  },
  {
    id: "2",
    name: "Residential Boundary - North",
    location: "North Perimeter Fence",
    currentLevel: 72,
    maxAllowed: 75,
    peakLevel: 78,
    peakTime: "2024-06-15T21:45:00",
    status: "warning",
    trend: "decreasing",
    lastUpdated: "2024-06-15T22:15:00",
  },
  {
    id: "3",
    name: "Residential Boundary - East",
    location: "East Perimeter",
    currentLevel: 68,
    maxAllowed: 75,
    peakLevel: 71,
    peakTime: "2024-06-15T20:00:00",
    status: "normal",
    trend: "stable",
    lastUpdated: "2024-06-15T22:15:00",
  },
  {
    id: "4",
    name: "Electronic Stage",
    location: "Electronic Stage Area",
    currentLevel: 102,
    maxAllowed: 100,
    peakLevel: 105,
    peakTime: "2024-06-15T22:00:00",
    status: "exceeded",
    trend: "increasing",
    lastUpdated: "2024-06-15T22:15:00",
  },
  {
    id: "5",
    name: "VIP Area",
    location: "VIP Pavilion",
    currentLevel: 85,
    maxAllowed: 95,
    peakLevel: 88,
    peakTime: "2024-06-15T21:00:00",
    status: "normal",
    trend: "decreasing",
    lastUpdated: "2024-06-15T22:15:00",
  },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  normal: { label: "Normal", color: "bg-green-500" },
  warning: { label: "Warning", color: "bg-yellow-500" },
  exceeded: { label: "Exceeded", color: "bg-red-500" },
};

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getLevelColor(current: number, max: number): string {
  const percentage = (current / max) * 100;
  if (percentage >= 100) return "bg-red-500";
  if (percentage >= 90) return "bg-yellow-500";
  return "bg-green-500";
}

export default function NoiseMonitoringPage() {
  const exceededCount = noiseMonitors.filter((m) => m.status === "exceeded").length;
  const warningCount = noiseMonitors.filter((m) => m.status === "warning").length;
  const avgLevel = Math.round(noiseMonitors.reduce((acc, m) => acc + m.currentLevel, 0) / noiseMonitors.length);

  const stats = {
    totalMonitors: noiseMonitors.length,
    exceededCount,
    warningCount,
    avgLevel,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Noise Monitoring"
        description="Real-time sound level monitoring"
        actions={
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Readings
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Active Monitors"
          value={stats.totalMonitors}
          icon={Volume2}
        />
        <StatCard
          title="Limits Exceeded"
          value={stats.exceededCount}
          valueClassName="text-red-500"
          icon={AlertTriangle}
        />
        <StatCard
          title="Warnings"
          value={stats.warningCount}
          valueClassName="text-yellow-500"
          icon={AlertTriangle}
        />
        <StatCard
          title="Average Level"
          value={`${stats.avgLevel} dB`}
          icon={Activity}
        />
      </StatGrid>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {noiseMonitors.map((monitor) => {
          const status = statusConfig[monitor.status];
          const levelPercentage = Math.min((monitor.currentLevel / monitor.maxAllowed) * 100, 100);
          const levelColor = getLevelColor(monitor.currentLevel, monitor.maxAllowed);

          return (
            <Card key={monitor.id} className={`hover:shadow-md transition-shadow ${monitor.status === "exceeded" ? "border-red-500 border-2" : monitor.status === "warning" ? "border-yellow-500" : ""}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${status.color}`}>
                      <Volume2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {monitor.name}
                        {monitor.status === "exceeded" && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {monitor.location}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${status.color} text-white`}>
                    {status.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{monitor.currentLevel}</p>
                      <p className="text-xs text-muted-foreground">dB Current</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {monitor.trend === "increasing" && (
                        <TrendingUp className="h-5 w-5 text-red-500" />
                      )}
                      {monitor.trend === "decreasing" && (
                        <TrendingDown className="h-5 w-5 text-green-500" />
                      )}
                      <span className="text-sm text-muted-foreground capitalize">{monitor.trend}</span>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-muted-foreground">{monitor.maxAllowed}</p>
                      <p className="text-xs text-muted-foreground">dB Limit</p>
                    </div>
                  </div>

                  <div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${levelColor}`}
                        style={{ width: `${levelPercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 text-center">
                      {Math.round(levelPercentage)}% of limit
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm pt-3 border-t">
                    <div>
                      <p className="text-muted-foreground">Peak Level</p>
                      <p className="font-medium">{monitor.peakLevel} dB at {formatTime(monitor.peakTime)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">Last Updated</p>
                      <p className="font-medium flex items-center justify-end gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(monitor.lastUpdated)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
