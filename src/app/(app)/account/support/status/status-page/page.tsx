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
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Server,
  Database,
  Globe,
  Zap,
} from "lucide-react";

interface ServiceStatus {
  id: string;
  name: string;
  status: "operational" | "degraded" | "outage" | "maintenance";
  uptime: number;
  responseTime: number;
  lastIncident?: string;
}

interface Incident {
  id: string;
  title: string;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  severity: "minor" | "major" | "critical";
  createdAt: string;
  updatedAt: string;
  affectedServices: string[];
}

const services: ServiceStatus[] = [
  {
    id: "1",
    name: "Web Application",
    status: "operational",
    uptime: 99.99,
    responseTime: 45,
  },
  {
    id: "2",
    name: "API",
    status: "operational",
    uptime: 99.98,
    responseTime: 32,
  },
  {
    id: "3",
    name: "Database",
    status: "operational",
    uptime: 99.99,
    responseTime: 12,
  },
  {
    id: "4",
    name: "Authentication",
    status: "operational",
    uptime: 99.99,
    responseTime: 28,
  },
  {
    id: "5",
    name: "File Storage",
    status: "degraded",
    uptime: 99.85,
    responseTime: 150,
    lastIncident: "2024-06-15",
  },
  {
    id: "6",
    name: "Email Service",
    status: "operational",
    uptime: 99.95,
    responseTime: 85,
  },
  {
    id: "7",
    name: "Payment Processing",
    status: "operational",
    uptime: 99.99,
    responseTime: 120,
  },
  {
    id: "8",
    name: "CDN",
    status: "operational",
    uptime: 99.99,
    responseTime: 15,
  },
];

const incidents: Incident[] = [
  {
    id: "1",
    title: "File Storage Degraded Performance",
    status: "monitoring",
    severity: "minor",
    createdAt: "2024-06-15T10:30:00",
    updatedAt: "2024-06-15T14:00:00",
    affectedServices: ["File Storage"],
  },
  {
    id: "2",
    title: "API Latency Issues",
    status: "resolved",
    severity: "minor",
    createdAt: "2024-06-10T08:00:00",
    updatedAt: "2024-06-10T10:30:00",
    affectedServices: ["API"],
  },
  {
    id: "3",
    title: "Scheduled Database Maintenance",
    status: "resolved",
    severity: "minor",
    createdAt: "2024-06-05T02:00:00",
    updatedAt: "2024-06-05T04:00:00",
    affectedServices: ["Database", "API"],
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType; bgColor: string }> = {
  operational: { label: "Operational", color: "text-green-500", icon: CheckCircle, bgColor: "bg-green-500" },
  degraded: { label: "Degraded", color: "text-yellow-500", icon: AlertTriangle, bgColor: "bg-yellow-500" },
  outage: { label: "Outage", color: "text-red-500", icon: XCircle, bgColor: "bg-red-500" },
  maintenance: { label: "Maintenance", color: "text-blue-500", icon: Clock, bgColor: "bg-blue-500" },
};

const incidentStatusConfig: Record<string, { label: string; color: string }> = {
  investigating: { label: "Investigating", color: "bg-red-500" },
  identified: { label: "Identified", color: "bg-orange-500" },
  monitoring: { label: "Monitoring", color: "bg-yellow-500" },
  resolved: { label: "Resolved", color: "bg-green-500" },
};

const severityConfig: Record<string, { label: string; color: string }> = {
  minor: { label: "Minor", color: "bg-yellow-500" },
  major: { label: "Major", color: "bg-orange-500" },
  critical: { label: "Critical", color: "bg-red-500" },
};

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function StatusPagePage() {
  const operationalCount = services.filter((s) => s.status === "operational").length;
  const allOperational = operationalCount === services.length;
  const avgUptime = (services.reduce((acc, s) => acc + s.uptime, 0) / services.length).toFixed(2);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Status</h1>
          <p className="text-muted-foreground">
            Current status of all platform services
          </p>
        </div>
      </div>

      <Card className={allOperational ? "border-green-500" : "border-yellow-500"}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            {allOperational ? (
              <CheckCircle className="h-12 w-12 text-green-500" />
            ) : (
              <AlertTriangle className="h-12 w-12 text-yellow-500" />
            )}
            <div>
              <h2 className={`text-2xl font-bold ${allOperational ? "text-green-500" : "text-yellow-500"}`}>
                {allOperational ? "All Systems Operational" : "Some Systems Degraded"}
              </h2>
              <p className="text-muted-foreground">
                {operationalCount} of {services.length} services operational • {avgUptime}% average uptime
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
          <CardDescription>Current status of all services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {services.map((service) => {
              const status = statusConfig[service.status];
              const StatusIcon = status.icon;

              return (
                <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <StatusIcon className={`h-5 w-5 ${status.color}`} />
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {service.uptime}% uptime • {service.responseTime}ms response
                      </p>
                    </div>
                  </div>
                  <Badge className={`${status.bgColor} text-white`}>
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
          <CardDescription>Past incidents and maintenance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {incidents.map((incident) => {
              const status = incidentStatusConfig[incident.status];
              const severity = severityConfig[incident.severity];

              return (
                <div key={incident.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{incident.title}</h4>
                        <Badge className={`${status.color} text-white`}>
                          {status.label}
                        </Badge>
                        <Badge className={`${severity.color} text-white`}>
                          {severity.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {incident.affectedServices.map((service, idx) => (
                          <Badge key={idx} variant="outline">{service}</Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
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

      <Card>
        <CardHeader>
          <CardTitle>Uptime History</CardTitle>
          <CardDescription>Last 90 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 border rounded-lg text-center">
              <Server className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-2xl font-bold mt-2 text-green-500">99.98%</p>
              <p className="text-sm text-muted-foreground">Web Application</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <Zap className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-2xl font-bold mt-2 text-green-500">99.97%</p>
              <p className="text-sm text-muted-foreground">API</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <Database className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-2xl font-bold mt-2 text-green-500">99.99%</p>
              <p className="text-sm text-muted-foreground">Database</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <Globe className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-2xl font-bold mt-2 text-green-500">99.99%</p>
              <p className="text-sm text-muted-foreground">CDN</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
