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
import {
  Network,
  Activity,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

interface Service {
  id: string;
  name: string;
  version: string;
  instances: number;
  status: "healthy" | "degraded" | "down";
  requestsPerSecond: number;
  errorRate: number;
  latency: number;
  dependencies: string[];
}

const services: Service[] = [
  {
    id: "1",
    name: "api-gateway",
    version: "v2.4.1",
    instances: 4,
    status: "healthy",
    requestsPerSecond: 1250,
    errorRate: 0.1,
    latency: 12,
    dependencies: ["auth-service", "user-service", "event-service"],
  },
  {
    id: "2",
    name: "auth-service",
    version: "v1.8.0",
    instances: 3,
    status: "healthy",
    requestsPerSecond: 450,
    errorRate: 0.05,
    latency: 8,
    dependencies: ["user-service", "redis-cache"],
  },
  {
    id: "3",
    name: "user-service",
    version: "v2.1.3",
    instances: 3,
    status: "healthy",
    requestsPerSecond: 680,
    errorRate: 0.08,
    latency: 15,
    dependencies: ["postgres-db", "redis-cache"],
  },
  {
    id: "4",
    name: "event-service",
    version: "v3.0.2",
    instances: 4,
    status: "healthy",
    requestsPerSecond: 890,
    errorRate: 0.12,
    latency: 25,
    dependencies: ["postgres-db", "notification-service"],
  },
  {
    id: "5",
    name: "notification-service",
    version: "v1.5.1",
    instances: 2,
    status: "degraded",
    requestsPerSecond: 320,
    errorRate: 2.5,
    latency: 45,
    dependencies: ["email-provider", "sms-provider"],
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  healthy: { label: "Healthy", color: "bg-green-500", icon: CheckCircle },
  degraded: { label: "Degraded", color: "bg-yellow-500", icon: AlertTriangle },
  down: { label: "Down", color: "bg-red-500", icon: AlertTriangle },
};

export default function ServiceMeshPage() {
  const healthyServices = services.filter((s) => s.status === "healthy").length;
  const totalInstances = services.reduce((acc, s) => acc + s.instances, 0);
  const totalRPS = services.reduce((acc, s) => acc + s.requestsPerSecond, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Mesh</h1>
          <p className="text-muted-foreground">
            Monitor microservices and their connections
          </p>
        </div>
        <Badge className={healthyServices === services.length ? "bg-green-500 text-white" : "bg-yellow-500 text-white"}>
          {healthyServices === services.length ? (
            <CheckCircle className="mr-1 h-3 w-3" />
          ) : (
            <AlertTriangle className="mr-1 h-3 w-3" />
          )}
          {healthyServices}/{services.length} Healthy
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Instances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInstances}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Requests/sec
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRPS.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Healthy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{healthyServices}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Services
          </CardTitle>
          <CardDescription>All microservices in the mesh</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => {
              const status = statusConfig[service.status];
              const StatusIcon = status.icon;

              return (
                <div key={service.id} className={`p-4 border rounded-lg ${service.status !== "healthy" ? "border-yellow-500" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-mono font-medium">{service.name}</h4>
                        <Badge variant="outline">{service.version}</Badge>
                        <Badge className={`${status.color} text-white`}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {status.label}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Instances</p>
                          <p className="text-xl font-bold">{service.instances}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Requests/sec</p>
                          <p className="text-xl font-bold">{service.requestsPerSecond}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Error Rate</p>
                          <p className={`text-xl font-bold ${service.errorRate > 1 ? "text-red-500" : "text-green-500"}`}>{service.errorRate}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Latency</p>
                          <p className="text-xl font-bold">{service.latency}ms</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                        <span>Dependencies:</span>
                        {service.dependencies.map((dep, idx) => (
                          <React.Fragment key={dep}>
                            <Badge variant="outline" className="text-xs">{dep}</Badge>
                            {idx < service.dependencies.length - 1 && <ArrowRight className="h-3 w-3" />}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    <Button variant="outline" size="sm">
                      <Activity className="mr-2 h-4 w-4" />
                      Metrics
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Traffic Distribution</CardTitle>
          <CardDescription>Request distribution across services</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {services.map((service) => {
            const percent = (service.requestsPerSecond / totalRPS) * 100;
            return (
              <div key={service.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-mono">{service.name}</span>
                  <span>{percent.toFixed(1)}%</span>
                </div>
                <Progress value={percent} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
