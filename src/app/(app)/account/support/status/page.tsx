"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import { Activity, CheckCircle, AlertCircle } from "lucide-react";

const services = [
  { name: "API", status: "operational", uptime: "99.99%" },
  { name: "Web Application", status: "operational", uptime: "99.98%" },
  { name: "Database", status: "operational", uptime: "99.99%" },
  { name: "File Storage", status: "degraded", uptime: "99.85%" },
];

export default function AccountSupportStatusPage() {
  const operationalCount = services.filter((s) => s.status === "operational").length;
  const degradedCount = services.filter((s) => s.status === "degraded").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Status"
        description="Platform status and uptime"
      />

      <StatGrid columns={3}>
        <StatCard
          title="Total Services"
          value={services.length}
          icon={Activity}
        />
        <StatCard
          title="Operational"
          value={operationalCount}
          valueClassName="text-green-500"
          icon={CheckCircle}
        />
        <StatCard
          title="Degraded"
          value={degradedCount}
          valueClassName="text-yellow-500"
          icon={AlertCircle}
        />
      </StatGrid>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />Service Status</CardTitle><CardDescription>Current system status</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {service.status === "operational" ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-yellow-500" />}
                  <div><h4 className="font-medium">{service.name}</h4><p className="text-sm text-muted-foreground">Uptime: {service.uptime}</p></div>
                </div>
                <Badge variant={service.status === "operational" ? "default" : "secondary"}>{service.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
