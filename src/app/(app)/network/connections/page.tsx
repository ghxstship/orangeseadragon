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
  Search,
  Plus,
  Link,
  Users,
  Building2,
  Mail,
  CheckCircle,
  Clock,
} from "lucide-react";

interface Connection {
  id: string;
  name: string;
  type: "person" | "company";
  role: string;
  company?: string;
  email: string;
  status: "connected" | "pending" | "invited";
  connectedAt?: string;
  mutualConnections: number;
}

const connections: Connection[] = [
  {
    id: "1",
    name: "Sarah Chen",
    type: "person",
    role: "Event Director",
    company: "Festival Productions",
    email: "sarah@festival.com",
    status: "connected",
    connectedAt: "2024-03-15",
    mutualConnections: 12,
  },
  {
    id: "2",
    name: "TechCorp Inc",
    type: "company",
    role: "Corporate Client",
    email: "events@techcorp.com",
    status: "connected",
    connectedAt: "2024-02-20",
    mutualConnections: 5,
  },
  {
    id: "3",
    name: "Mike Johnson",
    type: "person",
    role: "Sound Engineer",
    company: "Audio Excellence",
    email: "mike@audioex.com",
    status: "pending",
    mutualConnections: 8,
  },
  {
    id: "4",
    name: "Emily Watson",
    type: "person",
    role: "Catering Manager",
    company: "Gourmet Events",
    email: "emily@gourmet.com",
    status: "connected",
    connectedAt: "2024-04-10",
    mutualConnections: 15,
  },
  {
    id: "5",
    name: "Bright Lights Inc",
    type: "company",
    role: "Vendor",
    email: "info@brightlights.com",
    status: "invited",
    mutualConnections: 3,
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  connected: { label: "Connected", color: "bg-green-500", icon: CheckCircle },
  pending: { label: "Pending", color: "bg-yellow-500", icon: Clock },
  invited: { label: "Invited", color: "bg-blue-500", icon: Mail },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function ConnectionsPage() {
  const connectedCount = connections.filter((c) => c.status === "connected").length;
  const pendingCount = connections.filter((c) => c.status === "pending").length;
  const companies = connections.filter((c) => c.type === "company").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Connections</h1>
          <p className="text-muted-foreground">
            Manage your professional network
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Connection
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connections.length}</div>
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search connections..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Your Connections
          </CardTitle>
          <CardDescription>People and companies in your network</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {connections.map((connection) => {
              const status = statusConfig[connection.status];
              const StatusIcon = status.icon;

              return (
                <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${connection.type === "person" ? "bg-blue-500" : "bg-purple-500"}`}>
                      {connection.type === "person" ? (
                        <Users className="h-5 w-5 text-white" />
                      ) : (
                        <Building2 className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{connection.name}</h4>
                        <Badge className={`${status.color} text-white`}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{connection.role}</p>
                      {connection.company && (
                        <p className="text-xs text-muted-foreground">{connection.company}</p>
                      )}
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{connection.mutualConnections} mutual connections</span>
                        {connection.connectedAt && (
                          <span>Connected {formatDate(connection.connectedAt)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {connection.status === "pending" && (
                      <Button size="sm">Accept</Button>
                    )}
                    {connection.status === "connected" && (
                      <Button variant="outline" size="sm">Message</Button>
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
