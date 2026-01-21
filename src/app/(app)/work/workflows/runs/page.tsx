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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const workflowRuns = [
  {
    id: "run_001",
    workflow: "Event Approval Workflow",
    status: "completed",
    startedAt: "Jun 19, 2024 2:30 PM",
    duration: "45s",
    triggeredBy: "Event: Summer Festival",
  },
  {
    id: "run_002",
    workflow: "Invoice Processing",
    status: "running",
    startedAt: "Jun 19, 2024 2:45 PM",
    duration: "In progress",
    triggeredBy: "Booking: BK-2024-0156",
  },
  {
    id: "run_003",
    workflow: "Task Assignment",
    status: "failed",
    startedAt: "Jun 19, 2024 1:00 PM",
    duration: "12s",
    triggeredBy: "Project: Tech Summit",
  },
  {
    id: "run_004",
    workflow: "Reminder Notifications",
    status: "completed",
    startedAt: "Jun 19, 2024 9:00 AM",
    duration: "2m 15s",
    triggeredBy: "Scheduled",
  },
];

const statusIcons = {
  completed: CheckCircle,
  running: Play,
  failed: XCircle,
  pending: Clock,
};

const statusColors = {
  completed: "text-green-500",
  running: "text-blue-500",
  failed: "text-red-500",
  pending: "text-yellow-500",
};

export default function WorkflowRunsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflow Runs</h1>
          <p className="text-muted-foreground">
            Execution history and logs
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search runs..." className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">All</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">Completed</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">Running</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">Failed</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Runs Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflowRuns.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {workflowRuns.filter(r => r.status === "completed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Running
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {workflowRuns.filter(r => r.status === "running").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {workflowRuns.filter(r => r.status === "failed").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Run History</CardTitle>
          <CardDescription>Recent workflow executions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflowRuns.map((run) => {
              const StatusIcon = statusIcons[run.status as keyof typeof statusIcons];
              const statusColor = statusColors[run.status as keyof typeof statusColors];
              
              return (
                <div key={run.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <StatusIcon className={`h-5 w-5 ${statusColor}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{run.workflow}</h4>
                        <Badge variant={
                          run.status === "completed" ? "default" :
                          run.status === "running" ? "secondary" : "destructive"
                        }>
                          {run.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>ID: {run.id}</span>
                        <span>Started: {run.startedAt}</span>
                        <span>Duration: {run.duration}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Triggered by: {run.triggeredBy}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>View Logs</DropdownMenuItem>
                      {run.status === "failed" && (
                        <DropdownMenuItem>Retry</DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
