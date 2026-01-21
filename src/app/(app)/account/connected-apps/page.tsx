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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  Link2,
  Unlink,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

interface ConnectedApp {
  id: string;
  name: string;
  description: string;
  category: "payment" | "communication" | "storage" | "analytics" | "crm" | "accounting";
  status: "connected" | "error" | "expired";
  connectedAt: string;
  lastSync?: string;
  permissions: string[];
}

const connectedApps: ConnectedApp[] = [
  {
    id: "1",
    name: "Stripe",
    description: "Payment processing and billing",
    category: "payment",
    status: "connected",
    connectedAt: "2024-01-15",
    lastSync: "2024-06-15T14:30:00",
    permissions: ["Read payments", "Create charges", "Manage subscriptions"],
  },
  {
    id: "2",
    name: "Mailchimp",
    description: "Email marketing and campaigns",
    category: "communication",
    status: "connected",
    connectedAt: "2024-02-20",
    lastSync: "2024-06-15T12:00:00",
    permissions: ["Read contacts", "Send campaigns", "Manage lists"],
  },
  {
    id: "3",
    name: "Google Drive",
    description: "Cloud file storage and sharing",
    category: "storage",
    status: "connected",
    connectedAt: "2024-03-10",
    lastSync: "2024-06-15T10:00:00",
    permissions: ["Read files", "Write files", "Share files"],
  },
  {
    id: "4",
    name: "Google Analytics",
    description: "Website and app analytics",
    category: "analytics",
    status: "connected",
    connectedAt: "2024-01-20",
    lastSync: "2024-06-15T08:00:00",
    permissions: ["Read analytics data"],
  },
  {
    id: "5",
    name: "Salesforce",
    description: "Customer relationship management",
    category: "crm",
    status: "error",
    connectedAt: "2024-04-05",
    lastSync: "2024-06-14T16:00:00",
    permissions: ["Read contacts", "Write contacts", "Read opportunities"],
  },
  {
    id: "6",
    name: "QuickBooks",
    description: "Accounting and bookkeeping",
    category: "accounting",
    status: "expired",
    connectedAt: "2024-02-01",
    lastSync: "2024-06-01T09:00:00",
    permissions: ["Read invoices", "Write invoices", "Read reports"],
  },
];

const categoryConfig: Record<string, { label: string; color: string }> = {
  payment: { label: "Payment", color: "bg-green-500" },
  communication: { label: "Communication", color: "bg-blue-500" },
  storage: { label: "Storage", color: "bg-purple-500" },
  analytics: { label: "Analytics", color: "bg-orange-500" },
  crm: { label: "CRM", color: "bg-pink-500" },
  accounting: { label: "Accounting", color: "bg-indigo-500" },
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  connected: { label: "Connected", color: "bg-green-500", icon: CheckCircle },
  error: { label: "Error", color: "bg-red-500", icon: AlertTriangle },
  expired: { label: "Expired", color: "bg-yellow-500", icon: AlertTriangle },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ConnectedAppsPage() {
  const connectedCount = connectedApps.filter((a) => a.status === "connected").length;
  const errorCount = connectedApps.filter((a) => a.status === "error" || a.status === "expired").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Connected Apps</h1>
          <p className="text-muted-foreground">
            Manage third-party integrations
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Connect App
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Apps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedApps.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Connected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{connectedCount}</div>
          </CardContent>
        </Card>
        <Card className={errorCount > 0 ? "border-red-500" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{errorCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(categoryConfig).length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connected Applications</CardTitle>
          <CardDescription>Third-party services integrated with your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {connectedApps.map((app) => {
              const category = categoryConfig[app.category];
              const status = statusConfig[app.status];
              const StatusIcon = status.icon;

              return (
                <div key={app.id} className={`p-4 border rounded-lg ${app.status === "error" || app.status === "expired" ? "border-red-500" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-muted">
                        <Link2 className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{app.name}</h4>
                          <Badge className={`${category.color} text-white`}>
                            {category.label}
                          </Badge>
                          <Badge className={`${status.color} text-white`}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {app.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {app.permissions.map((permission, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Connected: {formatDate(app.connectedAt)}</span>
                          {app.lastSync && (
                            <span>Last sync: {formatDateTime(app.lastSync)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open App
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Sync Now
                        </DropdownMenuItem>
                        <DropdownMenuItem>Configure</DropdownMenuItem>
                        <DropdownMenuItem>View Logs</DropdownMenuItem>
                        {(app.status === "error" || app.status === "expired") && (
                          <DropdownMenuItem className="text-blue-600">Reconnect</DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive">
                          <Unlink className="mr-2 h-4 w-4" />
                          Disconnect
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
