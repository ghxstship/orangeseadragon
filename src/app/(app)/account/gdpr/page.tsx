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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  Shield,
  FileText,
  Download,
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Percent,
} from "lucide-react";

interface DataRequest {
  id: string;
  type: "access" | "deletion" | "portability" | "rectification";
  requester: string;
  email: string;
  status: "pending" | "in_progress" | "completed" | "rejected";
  requestedAt: string;
  dueDate: string;
}

const dataRequests: DataRequest[] = [
  {
    id: "1",
    type: "access",
    requester: "John Smith",
    email: "john.smith@example.com",
    status: "pending",
    requestedAt: "2024-06-14",
    dueDate: "2024-07-14",
  },
  {
    id: "2",
    type: "deletion",
    requester: "Sarah Johnson",
    email: "sarah.j@example.com",
    status: "in_progress",
    requestedAt: "2024-06-10",
    dueDate: "2024-07-10",
  },
  {
    id: "3",
    type: "portability",
    requester: "Mike Wilson",
    email: "m.wilson@example.com",
    status: "completed",
    requestedAt: "2024-06-01",
    dueDate: "2024-07-01",
  },
  {
    id: "4",
    type: "rectification",
    requester: "Emily Brown",
    email: "emily.b@example.com",
    status: "completed",
    requestedAt: "2024-05-28",
    dueDate: "2024-06-28",
  },
];

const typeConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  access: { label: "Data Access", color: "bg-blue-500", icon: FileText },
  deletion: { label: "Deletion", color: "bg-red-500", icon: Trash2 },
  portability: { label: "Portability", color: "bg-purple-500", icon: Download },
  rectification: { label: "Rectification", color: "bg-orange-500", icon: FileText },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-yellow-500" },
  in_progress: { label: "In Progress", color: "bg-blue-500" },
  completed: { label: "Completed", color: "bg-green-500" },
  rejected: { label: "Rejected", color: "bg-red-500" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function GDPRPage() {
  const pendingRequests = dataRequests.filter((r) => r.status === "pending" || r.status === "in_progress").length;
  const completedRequests = dataRequests.filter((r) => r.status === "completed").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="GDPR Compliance"
        description="Manage data subject requests and privacy settings"
        actions={
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Export Compliance Report
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Compliance Score"
          value="98%"
          valueClassName="text-green-500"
          icon={Percent}
        />
        <StatCard
          title="Pending Requests"
          value={pendingRequests}
          valueClassName="text-yellow-500"
          icon={Clock}
        />
        <StatCard
          title="Completed (30 days)"
          value={completedRequests}
          valueClassName="text-green-500"
          icon={CheckCircle}
        />
        <StatCard
          title="Avg. Response Time"
          value="5 days"
          icon={Clock}
        />
      </StatGrid>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Data Subject Requests</CardTitle>
            <CardDescription>GDPR Article 15-22 requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dataRequests.map((request) => {
                const type = typeConfig[request.type];
                const status = statusConfig[request.status];
                const TypeIcon = type.icon;

                return (
                  <div key={request.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${type.color}`}>
                          <TypeIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{request.requester}</h4>
                            <Badge className={`${type.color} text-white`}>
                              {type.label}
                            </Badge>
                            <Badge className={`${status.color} text-white`}>
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {request.email}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Requested: {formatDate(request.requestedAt)}
                            </span>
                            <span>Due: {formatDate(request.dueDate)}</span>
                          </div>
                        </div>
                      </div>

                      {(request.status === "pending" || request.status === "in_progress") && (
                        <Button size="sm">Process</Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
            <CardDescription>GDPR compliance controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Cookie Consent</Label>
                <p className="text-xs text-muted-foreground">Require explicit consent</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label>Data Encryption</Label>
                <p className="text-xs text-muted-foreground">Encrypt personal data</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label>Audit Logging</Label>
                <p className="text-xs text-muted-foreground">Log data access</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label>Auto-deletion</Label>
                <p className="text-xs text-muted-foreground">Delete inactive data</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label>Breach Notification</Label>
                <p className="text-xs text-muted-foreground">72-hour alerts</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance Checklist
          </CardTitle>
          <CardDescription>GDPR requirements status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Lawful Basis</p>
                <p className="text-xs text-muted-foreground">Article 6 - Documented</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Privacy Policy</p>
                <p className="text-xs text-muted-foreground">Article 13/14 - Published</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Data Processing Records</p>
                <p className="text-xs text-muted-foreground">Article 30 - Maintained</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">DPO Appointed</p>
                <p className="text-xs text-muted-foreground">Article 37 - Active</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-medium">DPIA</p>
                <p className="text-xs text-muted-foreground">Article 35 - Review needed</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Breach Procedures</p>
                <p className="text-xs text-muted-foreground">Article 33/34 - Documented</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
