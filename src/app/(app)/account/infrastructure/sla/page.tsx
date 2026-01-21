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
  Clock,
  CheckCircle,
  AlertTriangle,
  Target,
} from "lucide-react";

interface SLA {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  status: "met" | "at_risk" | "breached";
  category: string;
  period: string;
}

const slas: SLA[] = [
  {
    id: "1",
    name: "System Uptime",
    description: "Platform availability",
    target: 99.9,
    current: 99.95,
    unit: "%",
    status: "met",
    category: "Availability",
    period: "Monthly",
  },
  {
    id: "2",
    name: "API Response Time",
    description: "Average API latency",
    target: 200,
    current: 145,
    unit: "ms",
    status: "met",
    category: "Performance",
    period: "Daily",
  },
  {
    id: "3",
    name: "Support Response",
    description: "First response time",
    target: 4,
    current: 3.2,
    unit: "hours",
    status: "met",
    category: "Support",
    period: "Rolling",
  },
  {
    id: "4",
    name: "Issue Resolution",
    description: "Critical issue resolution",
    target: 24,
    current: 22,
    unit: "hours",
    status: "met",
    category: "Support",
    period: "Rolling",
  },
  {
    id: "5",
    name: "Data Backup",
    description: "Backup completion rate",
    target: 100,
    current: 98,
    unit: "%",
    status: "at_risk",
    category: "Data",
    period: "Daily",
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  met: { label: "Met", color: "bg-green-500", icon: CheckCircle },
  at_risk: { label: "At Risk", color: "bg-yellow-500", icon: AlertTriangle },
  breached: { label: "Breached", color: "bg-red-500", icon: AlertTriangle },
};

export default function SLAManagementPage() {
  const metCount = slas.filter((s) => s.status === "met").length;
  const atRiskCount = slas.filter((s) => s.status === "at_risk").length;
  const overallCompliance = Math.round((metCount / slas.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SLA Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage service level agreements
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add SLA
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{overallCompliance}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              SLAs Met
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{metCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              At Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{atRiskCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Breached
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">0</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search SLAs..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Service Level Agreements
          </CardTitle>
          <CardDescription>Current SLA status and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {slas.map((sla) => {
              const status = statusConfig[sla.status];
              const StatusIcon = status.icon;
              const progressValue = sla.unit === "%" 
                ? sla.current 
                : Math.min((sla.target / sla.current) * 100, 100);

              return (
                <div key={sla.id} className={`p-4 border rounded-lg ${sla.status === "at_risk" ? "border-yellow-500" : sla.status === "breached" ? "border-red-500" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{sla.name}</h4>
                        <Badge className={`${status.color} text-white`}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {status.label}
                        </Badge>
                        <Badge variant="outline">{sla.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{sla.description}</p>
                      
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Current: {sla.current}{sla.unit}</span>
                          <span>Target: {sla.target}{sla.unit}</span>
                        </div>
                        <Progress value={progressValue} className="h-2" />
                      </div>

                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {sla.period} measurement
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit SLA</DropdownMenuItem>
                        <DropdownMenuItem>View History</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
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
