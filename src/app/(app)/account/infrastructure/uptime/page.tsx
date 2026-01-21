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
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
} from "lucide-react";

interface Monitor {
  id: string;
  name: string;
  url: string;
  status: "up" | "down" | "degraded";
  uptime: number;
  responseTime: number;
  lastCheck: string;
  uptimeHistory: boolean[];
}

const monitors: Monitor[] = [
  {
    id: "1",
    name: "Main Website",
    url: "https://atlvs.com",
    status: "up",
    uptime: 99.99,
    responseTime: 145,
    lastCheck: "2024-06-15T15:30:00",
    uptimeHistory: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
  },
  {
    id: "2",
    name: "API Server",
    url: "https://api.atlvs.com",
    status: "up",
    uptime: 99.95,
    responseTime: 89,
    lastCheck: "2024-06-15T15:30:00",
    uptimeHistory: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, true, true],
  },
  {
    id: "3",
    name: "Dashboard",
    url: "https://app.atlvs.com",
    status: "up",
    uptime: 99.98,
    responseTime: 234,
    lastCheck: "2024-06-15T15:30:00",
    uptimeHistory: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
  },
  {
    id: "4",
    name: "Database",
    url: "internal://db.atlvs.com",
    status: "up",
    uptime: 99.99,
    responseTime: 12,
    lastCheck: "2024-06-15T15:30:00",
    uptimeHistory: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
  },
  {
    id: "5",
    name: "CDN",
    url: "https://cdn.atlvs.com",
    status: "up",
    uptime: 100,
    responseTime: 45,
    lastCheck: "2024-06-15T15:30:00",
    uptimeHistory: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  up: { label: "Operational", color: "bg-green-500", icon: CheckCircle },
  down: { label: "Down", color: "bg-red-500", icon: AlertTriangle },
  degraded: { label: "Degraded", color: "bg-yellow-500", icon: AlertTriangle },
};

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function UptimeMonitoringPage() {
  const allUp = monitors.every((m) => m.status === "up");
  const avgUptime = monitors.reduce((acc, m) => acc + m.uptime, 0) / monitors.length;
  const avgResponseTime = Math.round(monitors.reduce((acc, m) => acc + m.responseTime, 0) / monitors.length);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Uptime Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time service availability monitoring
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card className={allUp ? "border-green-500" : "border-red-500"}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            {allUp ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-red-500" />
            )}
            <div>
              <h3 className="text-xl font-bold">
                {allUp ? "All Systems Operational" : "Some Systems Experiencing Issues"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Last checked: {formatTime(monitors[0].lastCheck)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Services Monitored
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monitors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{avgUptime.toFixed(2)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime}ms</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Incidents (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Service Status
          </CardTitle>
          <CardDescription>Current status of all monitored services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monitors.map((monitor) => {
              const status = statusConfig[monitor.status];
              const StatusIcon = status.icon;

              return (
                <div key={monitor.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`h-5 w-5 ${monitor.status === "up" ? "text-green-500" : monitor.status === "degraded" ? "text-yellow-500" : "text-red-500"}`} />
                        <h4 className="font-medium">{monitor.name}</h4>
                        <Badge className={`${status.color} text-white`}>
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 font-mono">
                        {monitor.url}
                      </p>
                      
                      <div className="flex items-center gap-6 mt-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Uptime</p>
                          <p className="font-medium">{monitor.uptime}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Response</p>
                          <p className="font-medium">{monitor.responseTime}ms</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">Last 30 days</p>
                          <div className="flex gap-0.5">
                            {monitor.uptimeHistory.map((up, idx) => (
                              <div
                                key={idx}
                                className={`h-6 w-1.5 rounded-sm ${up ? "bg-green-500" : "bg-red-500"}`}
                                title={up ? "Operational" : "Incident"}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 inline mr-1" />
                      {formatTime(monitor.lastCheck)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
