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
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  MoreHorizontal,
  Server,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string;
  owner: string;
  tier: "critical" | "high" | "medium" | "low";
  status: "healthy" | "degraded" | "down";
  dependencies: string[];
  repository: string;
  documentation: string;
}

const services: Service[] = [
  {
    id: "1",
    name: "API Gateway",
    description: "Main API entry point and routing",
    owner: "Platform Team",
    tier: "critical",
    status: "healthy",
    dependencies: ["Auth Service", "Rate Limiter"],
    repository: "github.com/acme/api-gateway",
    documentation: "docs.acme.com/api-gateway",
  },
  {
    id: "2",
    name: "Auth Service",
    description: "Authentication and authorization",
    owner: "Security Team",
    tier: "critical",
    status: "healthy",
    dependencies: ["Database", "Cache"],
    repository: "github.com/acme/auth-service",
    documentation: "docs.acme.com/auth",
  },
  {
    id: "3",
    name: "Event Service",
    description: "Event management and processing",
    owner: "Events Team",
    tier: "high",
    status: "healthy",
    dependencies: ["Database", "Queue", "Notification Service"],
    repository: "github.com/acme/event-service",
    documentation: "docs.acme.com/events",
  },
  {
    id: "4",
    name: "Payment Service",
    description: "Payment processing and billing",
    owner: "Finance Team",
    tier: "critical",
    status: "healthy",
    dependencies: ["Database", "Stripe API"],
    repository: "github.com/acme/payment-service",
    documentation: "docs.acme.com/payments",
  },
  {
    id: "5",
    name: "Notification Service",
    description: "Email, SMS, and push notifications",
    owner: "Platform Team",
    tier: "medium",
    status: "healthy",
    dependencies: ["Queue", "SendGrid", "Twilio"],
    repository: "github.com/acme/notification-service",
    documentation: "docs.acme.com/notifications",
  },
];

const tierConfig: Record<string, { label: string; color: string }> = {
  critical: { label: "Critical", color: "bg-red-500" },
  high: { label: "High", color: "bg-orange-500" },
  medium: { label: "Medium", color: "bg-yellow-500" },
  low: { label: "Low", color: "bg-blue-500" },
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  healthy: { label: "Healthy", color: "bg-green-500", icon: CheckCircle },
  degraded: { label: "Degraded", color: "bg-yellow-500", icon: AlertTriangle },
  down: { label: "Down", color: "bg-red-500", icon: AlertTriangle },
};

export default function ServiceCatalogPage() {
  const criticalServices = services.filter((s) => s.tier === "critical").length;
  const healthyServices = services.filter((s) => s.status === "healthy").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Catalog</h1>
          <p className="text-muted-foreground">
            Directory of all services and their metadata
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Critical
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{criticalServices}</div>
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.from(new Set(services.map((s) => s.owner))).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search services..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Services
          </CardTitle>
          <CardDescription>All registered services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => {
              const tier = tierConfig[service.tier];
              const status = statusConfig[service.status];
              const StatusIcon = status.icon;

              return (
                <div key={service.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{service.name}</h4>
                        <Badge className={`${status.color} text-white`}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {status.label}
                        </Badge>
                        <Badge className={`${tier.color} text-white`}>
                          {tier.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Owner: {service.owner}</span>
                        <span>Dependencies: {service.dependencies.length}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {service.dependencies.map((dep, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {dep}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Docs
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>View Repository</DropdownMenuItem>
                          <DropdownMenuItem>View Metrics</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
