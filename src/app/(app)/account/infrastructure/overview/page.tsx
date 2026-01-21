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
  Server,
  Database,
  HardDrive,
  Cpu,
  Activity,
  CheckCircle,
  AlertTriangle,
  Layers,
} from "lucide-react";

interface InfraResource {
  id: string;
  name: string;
  type: "server" | "database" | "storage" | "cache";
  status: "healthy" | "warning" | "critical";
  region: string;
  usage: number;
  specs: string;
}

const resources: InfraResource[] = [
  {
    id: "1",
    name: "app-server-1",
    type: "server",
    status: "healthy",
    region: "us-east-1",
    usage: 45,
    specs: "4 vCPU, 16GB RAM",
  },
  {
    id: "2",
    name: "app-server-2",
    type: "server",
    status: "healthy",
    region: "us-east-1",
    usage: 52,
    specs: "4 vCPU, 16GB RAM",
  },
  {
    id: "3",
    name: "app-server-3",
    type: "server",
    status: "warning",
    region: "us-west-2",
    usage: 78,
    specs: "4 vCPU, 16GB RAM",
  },
  {
    id: "4",
    name: "primary-db",
    type: "database",
    status: "healthy",
    region: "us-east-1",
    usage: 65,
    specs: "8 vCPU, 32GB RAM, 500GB SSD",
  },
  {
    id: "5",
    name: "replica-db",
    type: "database",
    status: "healthy",
    region: "us-west-2",
    usage: 62,
    specs: "8 vCPU, 32GB RAM, 500GB SSD",
  },
  {
    id: "6",
    name: "file-storage",
    type: "storage",
    status: "healthy",
    region: "us-east-1",
    usage: 72,
    specs: "1TB S3",
  },
  {
    id: "7",
    name: "redis-cache",
    type: "cache",
    status: "healthy",
    region: "us-east-1",
    usage: 35,
    specs: "4GB Memory",
  },
];

const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  server: { icon: Server, color: "bg-blue-500" },
  database: { icon: Database, color: "bg-purple-500" },
  storage: { icon: HardDrive, color: "bg-green-500" },
  cache: { icon: Cpu, color: "bg-orange-500" },
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  healthy: { label: "Healthy", color: "bg-green-500", icon: CheckCircle },
  warning: { label: "Warning", color: "bg-yellow-500", icon: AlertTriangle },
  critical: { label: "Critical", color: "bg-red-500", icon: AlertTriangle },
};

export default function InfrastructurePage() {
  const healthyCount = resources.filter((r) => r.status === "healthy").length;
  const serverCount = resources.filter((r) => r.type === "server").length;
  const dbCount = resources.filter((r) => r.type === "database").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Infrastructure"
        description="Monitor and manage infrastructure resources"
        actions={
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="mr-1 h-3 w-3" />
            All Systems Operational
          </Badge>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Total Resources"
          value={resources.length}
          icon={Layers}
        />
        <StatCard
          title="Healthy"
          value={healthyCount}
          valueClassName="text-green-500"
          icon={CheckCircle}
        />
        <StatCard
          title="Servers"
          value={serverCount}
          icon={Server}
        />
        <StatCard
          title="Databases"
          value={dbCount}
          icon={Database}
        />
      </StatGrid>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Infrastructure Resources
          </CardTitle>
          <CardDescription>All managed infrastructure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {resources.map((resource) => {
              const type = typeConfig[resource.type];
              const status = statusConfig[resource.status];
              const TypeIcon = type.icon;
              const StatusIcon = status.icon;

              return (
                <div key={resource.id} className={`p-4 border rounded-lg ${resource.status === "warning" ? "border-yellow-500" : resource.status === "critical" ? "border-red-500" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${type.color}`}>
                        <TypeIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-mono font-medium">{resource.name}</h4>
                          <Badge className={`${status.color} text-white`}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{resource.specs}</p>
                        <p className="text-xs text-muted-foreground mt-1">Region: {resource.region}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Usage</span>
                      <span className={resource.usage > 75 ? "text-yellow-500" : ""}>{resource.usage}%</span>
                    </div>
                    <Progress value={resource.usage} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Regions</CardTitle>
            <CardDescription>Resource distribution by region</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">us-east-1</span>
                <Badge variant="outline">{resources.filter((r) => r.region === "us-east-1").length} resources</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">us-west-2</span>
                <Badge variant="outline">{resources.filter((r) => r.region === "us-west-2").length} resources</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common infrastructure operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 grid-cols-2">
              <Button variant="outline">Scale Servers</Button>
              <Button variant="outline">Add Database</Button>
              <Button variant="outline">View Metrics</Button>
              <Button variant="outline">View Logs</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
