"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/common";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Server,
  Database,
  Cpu,
  HardDrive,
  CheckCircle,
} from "lucide-react";

interface Metric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  trend: "up" | "down" | "stable";
  status: "healthy" | "warning" | "critical";
}

const metrics: Metric[] = [
  {
    id: "1",
    name: "CPU Usage",
    value: 45,
    unit: "%",
    change: 5,
    trend: "up",
    status: "healthy",
  },
  {
    id: "2",
    name: "Memory Usage",
    value: 68,
    unit: "%",
    change: -3,
    trend: "down",
    status: "healthy",
  },
  {
    id: "3",
    name: "Disk Usage",
    value: 72,
    unit: "%",
    change: 2,
    trend: "up",
    status: "warning",
  },
  {
    id: "4",
    name: "Network I/O",
    value: 156,
    unit: "MB/s",
    change: 12,
    trend: "up",
    status: "healthy",
  },
];

const serviceMetrics = [
  { name: "API Gateway", requests: 12500, latency: 45, errors: 0.1 },
  { name: "Auth Service", requests: 8200, latency: 23, errors: 0.05 },
  { name: "Event Service", requests: 5600, latency: 89, errors: 0.2 },
  { name: "Payment Service", requests: 1200, latency: 156, errors: 0.3 },
];

const statusConfig: Record<string, { color: string }> = {
  healthy: { color: "bg-green-500" },
  warning: { color: "bg-yellow-500" },
  critical: { color: "bg-red-500" },
};

export default function MetricsDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Metrics Dashboard"
        description="System performance and health metrics"
        actions={
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="mr-1 h-3 w-3" />
            All Systems Healthy
          </Badge>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const status = statusConfig[metric.status];
          const TrendIcon = metric.trend === "up" ? TrendingUp : metric.trend === "down" ? TrendingDown : Activity;
          const trendColor = metric.trend === "up" 
            ? metric.name.includes("Usage") ? "text-yellow-500" : "text-green-500"
            : metric.name.includes("Usage") ? "text-green-500" : "text-red-500";

          return (
            <Card key={metric.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  {metric.name}
                  <Badge className={`${status.color} text-white`}>
                    {metric.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}{metric.unit}</div>
                <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
                  <TrendIcon className="h-4 w-4" />
                  {metric.change > 0 ? "+" : ""}{metric.change}% from last hour
                </div>
                <Progress value={metric.value} className="h-2 mt-2" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Service Metrics
            </CardTitle>
            <CardDescription>Per-service performance (last hour)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {serviceMetrics.map((service, idx) => (
                <div key={idx} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{service.name}</h4>
                    <Badge variant="outline" className="bg-green-50">
                      Healthy
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Requests</p>
                      <p className="font-medium">{service.requests.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Latency</p>
                      <p className="font-medium">{service.latency}ms</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Error Rate</p>
                      <p className="font-medium">{service.errors}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Infrastructure
            </CardTitle>
            <CardDescription>Server and database metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Application Servers</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Instances</p>
                  <p className="font-medium">4 / 4 healthy</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Avg Load</p>
                  <p className="font-medium">45%</p>
                </div>
              </div>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Database Cluster</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Connections</p>
                  <p className="font-medium">156 / 500</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Query Time</p>
                  <p className="font-medium">12ms avg</p>
                </div>
              </div>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Storage</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Used</p>
                  <p className="font-medium">720 GB / 1 TB</p>
                </div>
                <div>
                  <p className="text-muted-foreground">IOPS</p>
                  <p className="font-medium">3,200</p>
                </div>
              </div>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Cache</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Hit Rate</p>
                  <p className="font-medium">94.5%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Memory</p>
                  <p className="font-medium">2.4 GB / 4 GB</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
