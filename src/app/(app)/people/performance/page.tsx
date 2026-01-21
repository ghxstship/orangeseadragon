"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/common";
import {
  RefreshCw,
  Cpu,
  HardDrive,
  Activity,
  Zap,
  Clock,
  Server,
  Database,
} from "lucide-react";

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: "healthy" | "warning" | "critical";
  threshold: number;
  trend: "up" | "down" | "stable";
}

const metrics: PerformanceMetric[] = [
  {
    id: "1",
    name: "CPU Usage",
    value: 42,
    unit: "%",
    status: "healthy",
    threshold: 80,
    trend: "stable",
  },
  {
    id: "2",
    name: "Memory Usage",
    value: 68,
    unit: "%",
    status: "warning",
    threshold: 75,
    trend: "up",
  },
  {
    id: "3",
    name: "Disk Usage",
    value: 55,
    unit: "%",
    status: "healthy",
    threshold: 85,
    trend: "up",
  },
  {
    id: "4",
    name: "Network I/O",
    value: 125,
    unit: "MB/s",
    status: "healthy",
    threshold: 500,
    trend: "stable",
  },
];

interface ServiceStatus {
  id: string;
  name: string;
  status: "online" | "degraded" | "offline";
  responseTime: number;
  uptime: number;
  lastCheck: string;
}

const services: ServiceStatus[] = [
  {
    id: "1",
    name: "API Gateway",
    status: "online",
    responseTime: 45,
    uptime: 99.99,
    lastCheck: "2024-06-15T15:30:00",
  },
  {
    id: "2",
    name: "Database",
    status: "online",
    responseTime: 12,
    uptime: 99.95,
    lastCheck: "2024-06-15T15:30:00",
  },
  {
    id: "3",
    name: "Authentication",
    status: "online",
    responseTime: 28,
    uptime: 99.98,
    lastCheck: "2024-06-15T15:30:00",
  },
  {
    id: "4",
    name: "File Storage",
    status: "online",
    responseTime: 85,
    uptime: 99.90,
    lastCheck: "2024-06-15T15:30:00",
  },
  {
    id: "5",
    name: "Email Service",
    status: "degraded",
    responseTime: 250,
    uptime: 98.50,
    lastCheck: "2024-06-15T15:30:00",
  },
  {
    id: "6",
    name: "Payment Gateway",
    status: "online",
    responseTime: 120,
    uptime: 99.99,
    lastCheck: "2024-06-15T15:30:00",
  },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  online: { label: "Online", color: "bg-green-500" },
  degraded: { label: "Degraded", color: "bg-yellow-500" },
  offline: { label: "Offline", color: "bg-red-500" },
  healthy: { label: "Healthy", color: "bg-green-500" },
  warning: { label: "Warning", color: "bg-yellow-500" },
  critical: { label: "Critical", color: "bg-red-500" },
};

const metricIcons: Record<string, React.ElementType> = {
  "CPU Usage": Cpu,
  "Memory Usage": Activity,
  "Disk Usage": HardDrive,
  "Network I/O": Zap,
};

export default function PerformancePage() {
  const onlineServices = services.filter((s) => s.status === "online").length;
  const avgResponseTime = Math.round(services.reduce((acc, s) => acc + s.responseTime, 0) / services.length);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance"
        description="System performance and health monitoring"
        actions={
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const status = statusConfig[metric.status];
          const Icon = metricIcons[metric.name] || Activity;
          const percentage = metric.unit === "%" ? metric.value : Math.round((metric.value / metric.threshold) * 100);

          return (
            <Card key={metric.id} className={metric.status === "warning" ? "border-yellow-500" : metric.status === "critical" ? "border-red-500" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {metric.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <span className={`text-2xl font-bold ${metric.status === "warning" ? "text-yellow-500" : metric.status === "critical" ? "text-red-500" : ""}`}>
                    {metric.value}
                  </span>
                  <span className="text-muted-foreground mb-1">{metric.unit}</span>
                </div>
                <Progress value={percentage} className="h-2 mt-2" />
                <div className="flex justify-between mt-1">
                  <Badge className={`${status.color} text-white text-xs`}>
                    {status.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Threshold: {metric.threshold}{metric.unit}
                  </span>
                </div>
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
              Service Status
            </CardTitle>
            <CardDescription>
              {onlineServices}/{services.length} services online
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {services.map((service) => {
                const status = statusConfig[service.status];

                return (
                  <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${status.color}`} />
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Uptime: {service.uptime}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`${status.color} text-white`}>
                        {status.label}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {service.responseTime}ms
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Response Times
            </CardTitle>
            <CardDescription>
              Average: {avgResponseTime}ms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {services.map((service) => {
                const percentage = Math.min((service.responseTime / 300) * 100, 100);
                const isSlowResponse = service.responseTime > 200;

                return (
                  <div key={service.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{service.name}</span>
                      <span className={isSlowResponse ? "text-yellow-500" : ""}>{service.responseTime}ms</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Performance
          </CardTitle>
          <CardDescription>Database query and connection metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Active Connections</p>
              <p className="text-2xl font-bold">24 / 100</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Queries/sec</p>
              <p className="text-2xl font-bold">156</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Avg Query Time</p>
              <p className="text-2xl font-bold">8.5ms</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Cache Hit Rate</p>
              <p className="text-2xl font-bold text-green-500">94.2%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
