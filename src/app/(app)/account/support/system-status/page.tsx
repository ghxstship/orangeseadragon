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
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";

interface SystemComponent {
  id: string;
  name: string;
  status: "operational" | "degraded" | "outage" | "maintenance";
  uptime: number;
  lastIncident?: string;
}

interface Incident {
  id: string;
  title: string;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  severity: "minor" | "major" | "critical";
  createdAt: string;
  updatedAt: string;
}

const systemComponents: SystemComponent[] = [
  { id: "1", name: "Web Application", status: "operational", uptime: 99.99 },
  { id: "2", name: "API Services", status: "operational", uptime: 99.98 },
  { id: "3", name: "Database", status: "operational", uptime: 99.99 },
  { id: "4", name: "Authentication", status: "operational", uptime: 99.97 },
  { id: "5", name: "File Storage", status: "operational", uptime: 99.95 },
  { id: "6", name: "Email Delivery", status: "degraded", uptime: 98.5, lastIncident: "2024-06-15" },
  { id: "7", name: "Payment Processing", status: "operational", uptime: 99.99 },
  { id: "8", name: "Real-time Sync", status: "operational", uptime: 99.92 },
];

const recentIncidents: Incident[] = [
  {
    id: "1",
    title: "Email delivery delays",
    status: "monitoring",
    severity: "minor",
    createdAt: "2024-06-15T14:00:00",
    updatedAt: "2024-06-15T15:30:00",
  },
  {
    id: "2",
    title: "API latency increase",
    status: "resolved",
    severity: "minor",
    createdAt: "2024-06-14T10:00:00",
    updatedAt: "2024-06-14T11:30:00",
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  operational: { label: "Operational", color: "bg-green-500", icon: CheckCircle },
  degraded: { label: "Degraded", color: "bg-yellow-500", icon: AlertTriangle },
  outage: { label: "Outage", color: "bg-red-500", icon: AlertTriangle },
  maintenance: { label: "Maintenance", color: "bg-blue-500", icon: Clock },
};

const incidentStatusConfig: Record<string, { label: string; color: string }> = {
  investigating: { label: "Investigating", color: "bg-red-500" },
  identified: { label: "Identified", color: "bg-yellow-500" },
  monitoring: { label: "Monitoring", color: "bg-blue-500" },
  resolved: { label: "Resolved", color: "bg-green-500" },
};

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SystemStatusPage() {
  const operationalCount = systemComponents.filter((c) => c.status === "operational").length;
  const allOperational = operationalCount === systemComponents.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Status</h1>
          <p className="text-muted-foreground">
            Real-time platform health and status
          </p>
        </div>
        <Badge className={allOperational ? "bg-green-500 text-white" : "bg-yellow-500 text-white"}>
          {allOperational ? (
            <CheckCircle className="mr-1 h-3 w-3" />
          ) : (
            <AlertTriangle className="mr-1 h-3 w-3" />
          )}
          {allOperational ? "All Systems Operational" : "Partial Outage"}
        </Badge>
      </div>

      <Card className={allOperational ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            {allOperational ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            )}
            <div>
              <h3 className="text-lg font-medium">
                {allOperational ? "All systems are operational" : "Some systems are experiencing issues"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {operationalCount} of {systemComponents.length} components operational
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Components
          </CardTitle>
          <CardDescription>Current status of all platform components</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {systemComponents.map((component) => {
              const status = statusConfig[component.status];
              const StatusIcon = status.icon;

              return (
                <div key={component.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <StatusIcon className={`h-5 w-5 ${component.status === "operational" ? "text-green-500" : component.status === "degraded" ? "text-yellow-500" : "text-red-500"}`} />
                    <div>
                      <p className="font-medium">{component.name}</p>
                      <p className="text-xs text-muted-foreground">{component.uptime}% uptime</p>
                    </div>
                  </div>
                  <Badge className={`${status.color} text-white`}>
                    {status.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
          <CardDescription>Past and ongoing incidents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentIncidents.map((incident) => {
              const status = incidentStatusConfig[incident.status];

              return (
                <div key={incident.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{incident.title}</h4>
                        <Badge className={`${status.color} text-white`}>
                          {status.label}
                        </Badge>
                        <Badge variant="outline">{incident.severity}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>Started: {formatDateTime(incident.createdAt)}</span>
                        <span>Updated: {formatDateTime(incident.updatedAt)}</span>
                      </div>
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
