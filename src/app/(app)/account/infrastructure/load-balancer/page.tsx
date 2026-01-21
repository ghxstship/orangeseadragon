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
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  Network,
  Server,
  CheckCircle,
  AlertTriangle,
  Settings,
  Activity,
  Link,
} from "lucide-react";

interface LoadBalancer {
  id: string;
  name: string;
  type: "application" | "network";
  status: "healthy" | "degraded" | "down";
  targets: Target[];
  requestsPerSecond: number;
  activeConnections: number;
}

interface Target {
  id: string;
  name: string;
  status: "healthy" | "unhealthy" | "draining";
  weight: number;
  connections: number;
}

const loadBalancers: LoadBalancer[] = [
  {
    id: "1",
    name: "web-alb",
    type: "application",
    status: "healthy",
    requestsPerSecond: 1250,
    activeConnections: 3400,
    targets: [
      { id: "t1", name: "web-server-1", status: "healthy", weight: 1, connections: 850 },
      { id: "t2", name: "web-server-2", status: "healthy", weight: 1, connections: 820 },
      { id: "t3", name: "web-server-3", status: "healthy", weight: 1, connections: 890 },
      { id: "t4", name: "web-server-4", status: "healthy", weight: 1, connections: 840 },
    ],
  },
  {
    id: "2",
    name: "api-alb",
    type: "application",
    status: "healthy",
    requestsPerSecond: 890,
    activeConnections: 2100,
    targets: [
      { id: "t5", name: "api-server-1", status: "healthy", weight: 1, connections: 720 },
      { id: "t6", name: "api-server-2", status: "healthy", weight: 1, connections: 680 },
      { id: "t7", name: "api-server-3", status: "healthy", weight: 1, connections: 700 },
    ],
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  healthy: { label: "Healthy", color: "bg-green-500", icon: CheckCircle },
  degraded: { label: "Degraded", color: "bg-yellow-500", icon: AlertTriangle },
  down: { label: "Down", color: "bg-red-500", icon: AlertTriangle },
  unhealthy: { label: "Unhealthy", color: "bg-red-500", icon: AlertTriangle },
  draining: { label: "Draining", color: "bg-yellow-500", icon: AlertTriangle },
};

export default function LoadBalancerPage() {
  const totalRPS = loadBalancers.reduce((acc, lb) => acc + lb.requestsPerSecond, 0);
  const totalConnections = loadBalancers.reduce((acc, lb) => acc + lb.activeConnections, 0);
  const totalTargets = loadBalancers.reduce((acc, lb) => acc + lb.targets.length, 0);
  const healthyTargets = loadBalancers.reduce(
    (acc, lb) => acc + lb.targets.filter((t) => t.status === "healthy").length,
    0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Load Balancer"
        description="Manage load balancers and target groups"
        actions={
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="mr-1 h-3 w-3" />
            All Healthy
          </Badge>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Load Balancers"
          value={loadBalancers.length}
          icon={Network}
        />
        <StatCard
          title="Targets"
          value={`${healthyTargets}/${totalTargets}`}
          icon={Server}
        />
        <StatCard
          title="Requests/sec"
          value={totalRPS.toLocaleString()}
          icon={Activity}
        />
        <StatCard
          title="Active Connections"
          value={totalConnections.toLocaleString()}
          icon={Link}
        />
      </StatGrid>

      {loadBalancers.map((lb) => {
        const status = statusConfig[lb.status];
        const StatusIcon = status.icon;

        return (
          <Card key={lb.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  <CardTitle>{lb.name}</CardTitle>
                  <Badge className={`${status.color} text-white`}>
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {status.label}
                  </Badge>
                  <Badge variant="outline">{lb.type}</Badge>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Configure
                </Button>
              </div>
              <CardDescription>
                {lb.requestsPerSecond} req/s • {lb.activeConnections} connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lb.targets.map((target) => {
                  const targetStatus = statusConfig[target.status];
                  const TargetStatusIcon = targetStatus.icon;
                  const connectionPercent = (target.connections / lb.activeConnections) * 100;

                  return (
                    <div key={target.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Server className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium">{target.name}</span>
                            <Badge className={`${targetStatus.color} text-white`}>
                              <TargetStatusIcon className="mr-1 h-3 w-3" />
                              {targetStatus.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Weight: {target.weight} • {target.connections} connections
                          </p>
                        </div>
                      </div>
                      <div className="w-32">
                        <Progress value={connectionPercent} className="h-2" />
                        <p className="text-xs text-muted-foreground text-right mt-1">
                          {connectionPercent.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
