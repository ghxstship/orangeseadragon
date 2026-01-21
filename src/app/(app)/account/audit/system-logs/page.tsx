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
  Download,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Server,
} from "lucide-react";

interface SystemLog {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "success";
  source: string;
  message: string;
  details?: string;
}

const systemLogs: SystemLog[] = [
  {
    id: "1",
    timestamp: "2024-06-15T15:30:45",
    level: "info",
    source: "API Gateway",
    message: "Request processed successfully",
    details: "GET /api/events - 200 OK - 45ms",
  },
  {
    id: "2",
    timestamp: "2024-06-15T15:30:30",
    level: "warning",
    source: "Database",
    message: "Slow query detected",
    details: "Query took 2.5s - SELECT * FROM transactions WHERE...",
  },
  {
    id: "3",
    timestamp: "2024-06-15T15:30:15",
    level: "error",
    source: "Payment Service",
    message: "Payment processing failed",
    details: "Transaction ID: TXN-001238 - Gateway timeout",
  },
  {
    id: "4",
    timestamp: "2024-06-15T15:30:00",
    level: "success",
    source: "Backup Service",
    message: "Daily backup completed",
    details: "Backup size: 2.4 GB - Duration: 15 minutes",
  },
  {
    id: "5",
    timestamp: "2024-06-15T15:29:45",
    level: "info",
    source: "Auth Service",
    message: "User login successful",
    details: "User: sarah.chen@atlvs.com - IP: 192.168.1.xxx",
  },
  {
    id: "6",
    timestamp: "2024-06-15T15:29:30",
    level: "warning",
    source: "Memory Monitor",
    message: "High memory usage detected",
    details: "Current usage: 85% - Threshold: 80%",
  },
  {
    id: "7",
    timestamp: "2024-06-15T15:29:15",
    level: "info",
    source: "Scheduler",
    message: "Scheduled task executed",
    details: "Task: email_notifications - Duration: 3.2s",
  },
  {
    id: "8",
    timestamp: "2024-06-15T15:29:00",
    level: "error",
    source: "Email Service",
    message: "Failed to send email",
    details: "Recipient: vendor@example.com - SMTP connection refused",
  },
];

const levelConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  info: { label: "Info", color: "bg-blue-500", icon: Info },
  warning: { label: "Warning", color: "bg-yellow-500", icon: AlertTriangle },
  error: { label: "Error", color: "bg-red-500", icon: AlertCircle },
  success: { label: "Success", color: "bg-green-500", icon: CheckCircle },
};

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function SystemLogsPage() {
  const totalLogs = systemLogs.length;
  const errorCount = systemLogs.filter((l) => l.level === "error").length;
  const warningCount = systemLogs.filter((l) => l.level === "warning").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
          <p className="text-muted-foreground">
            Monitor system events and errors
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLogs}</div>
          </CardContent>
        </Card>
        <Card className={errorCount > 0 ? "border-red-500" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{errorCount}</div>
          </CardContent>
        </Card>
        <Card className={warningCount > 0 ? "border-yellow-500" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{warningCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-500 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Operational
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search logs..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log Entries</CardTitle>
          <CardDescription>Recent system log entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {systemLogs.map((log) => {
              const level = levelConfig[log.level];
              const LevelIcon = level.icon;

              return (
                <div key={log.id} className={`p-3 border rounded-lg font-mono text-sm ${log.level === "error" ? "border-red-500 bg-red-50 dark:bg-red-950/20" : log.level === "warning" ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20" : ""}`}>
                  <div className="flex items-start gap-3">
                    <LevelIcon className={`h-4 w-4 mt-0.5 ${log.level === "error" ? "text-red-500" : log.level === "warning" ? "text-yellow-500" : log.level === "success" ? "text-green-500" : "text-blue-500"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`${level.color} text-white text-xs`}>
                          {level.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatDateTime(log.timestamp)}</span>
                        <Badge variant="outline" className="text-xs">
                          <Server className="mr-1 h-3 w-3" />
                          {log.source}
                        </Badge>
                      </div>
                      <p className="mt-1 font-medium">{log.message}</p>
                      {log.details && (
                        <p className="mt-1 text-xs text-muted-foreground break-all">{log.details}</p>
                      )}
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
