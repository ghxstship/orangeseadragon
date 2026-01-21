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
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  Box,
  Server,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Layers,
} from "lucide-react";

interface Pod {
  id: string;
  name: string;
  namespace: string;
  status: "Running" | "Pending" | "Failed" | "Succeeded";
  restarts: number;
  cpu: number;
  memory: number;
  age: string;
}

interface Node {
  id: string;
  name: string;
  status: "Ready" | "NotReady";
  cpu: number;
  memory: number;
  pods: number;
  maxPods: number;
}

const pods: Pod[] = [
  { id: "1", name: "api-gateway-7d8f9c6b5-abc12", namespace: "production", status: "Running", restarts: 0, cpu: 45, memory: 62, age: "5d" },
  { id: "2", name: "api-gateway-7d8f9c6b5-def34", namespace: "production", status: "Running", restarts: 0, cpu: 42, memory: 58, age: "5d" },
  { id: "3", name: "auth-service-5c4d3e2f1-ghi56", namespace: "production", status: "Running", restarts: 1, cpu: 28, memory: 45, age: "3d" },
  { id: "4", name: "user-service-8b7a6c5d4-jkl78", namespace: "production", status: "Running", restarts: 0, cpu: 35, memory: 52, age: "2d" },
  { id: "5", name: "event-service-2e3f4g5h6-mno90", namespace: "production", status: "Running", restarts: 0, cpu: 55, memory: 68, age: "1d" },
  { id: "6", name: "notification-svc-1a2b3c4d5-pqr12", namespace: "production", status: "Pending", restarts: 0, cpu: 0, memory: 0, age: "5m" },
];

const nodes: Node[] = [
  { id: "1", name: "node-pool-1-abc", status: "Ready", cpu: 65, memory: 72, pods: 12, maxPods: 30 },
  { id: "2", name: "node-pool-1-def", status: "Ready", cpu: 58, memory: 68, pods: 10, maxPods: 30 },
  { id: "3", name: "node-pool-1-ghi", status: "Ready", cpu: 45, memory: 55, pods: 8, maxPods: 30 },
];

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  Running: { color: "bg-green-500", icon: CheckCircle },
  Ready: { color: "bg-green-500", icon: CheckCircle },
  Pending: { color: "bg-yellow-500", icon: RefreshCw },
  Failed: { color: "bg-red-500", icon: AlertTriangle },
  NotReady: { color: "bg-red-500", icon: AlertTriangle },
  Succeeded: { color: "bg-blue-500", icon: CheckCircle },
};

export default function KubernetesPage() {
  const runningPods = pods.filter((p) => p.status === "Running").length;
  const readyNodes = nodes.filter((n) => n.status === "Ready").length;
  const totalPods = nodes.reduce((acc, n) => acc + n.pods, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kubernetes"
        description="Manage Kubernetes clusters and workloads"
        actions={
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="mr-1 h-3 w-3" />
            Cluster Healthy
          </Badge>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Nodes"
          value={`${readyNodes}/${nodes.length}`}
          icon={Server}
        />
        <StatCard
          title="Pods"
          value={`${runningPods}/${pods.length}`}
          icon={Box}
        />
        <StatCard
          title="Total Pods"
          value={totalPods}
          icon={Box}
        />
        <StatCard
          title="Namespaces"
          value={4}
          icon={Layers}
        />
      </StatGrid>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Nodes
          </CardTitle>
          <CardDescription>Cluster nodes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {nodes.map((node) => {
              const status = statusConfig[node.status];
              const StatusIcon = status.icon;

              return (
                <div key={node.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">{node.name}</span>
                          <Badge className={`${status.color} text-white`}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {node.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {node.pods}/{node.maxPods} pods
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-8">
                      <div className="w-24">
                        <p className="text-xs text-muted-foreground mb-1">CPU</p>
                        <Progress value={node.cpu} className="h-2" />
                        <p className="text-xs text-right mt-1">{node.cpu}%</p>
                      </div>
                      <div className="w-24">
                        <p className="text-xs text-muted-foreground mb-1">Memory</p>
                        <Progress value={node.memory} className="h-2" />
                        <p className="text-xs text-right mt-1">{node.memory}%</p>
                      </div>
                    </div>
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
            <Box className="h-5 w-5" />
            Pods
          </CardTitle>
          <CardDescription>Running workloads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pods.map((pod) => {
              const status = statusConfig[pod.status];
              const StatusIcon = status.icon;

              return (
                <div key={pod.id} className={`p-4 border rounded-lg ${pod.status !== "Running" ? "border-yellow-500" : ""}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{pod.name}</span>
                        <Badge className={`${status.color} text-white`}>
                          <StatusIcon className={`mr-1 h-3 w-3 ${pod.status === "Pending" ? "animate-spin" : ""}`} />
                          {pod.status}
                        </Badge>
                        <Badge variant="outline">{pod.namespace}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>Age: {pod.age}</span>
                        <span>Restarts: {pod.restarts}</span>
                      </div>
                    </div>
                    {pod.status === "Running" && (
                      <div className="flex gap-4">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">CPU</p>
                          <p className="font-medium">{pod.cpu}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Memory</p>
                          <p className="font-medium">{pod.memory}%</p>
                        </div>
                      </div>
                    )}
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
