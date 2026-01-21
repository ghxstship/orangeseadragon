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
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  Search,
  FileText,
  Download,
  Filter,
  RefreshCw,
  AlertTriangle,
  Server,
} from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  service: string;
  message: string;
  metadata?: Record<string, string>;
}

const logEntries: LogEntry[] = [
  {
    id: "1",
    timestamp: "2024-06-15T15:30:45.123Z",
    level: "info",
    service: "api-gateway",
    message: "Request processed successfully",
    metadata: { requestId: "req_abc123", duration: "145ms" },
  },
  {
    id: "2",
    timestamp: "2024-06-15T15:30:44.892Z",
    level: "warn",
    service: "auth-service",
    message: "Rate limit approaching for user",
    metadata: { userId: "usr_xyz789", currentRate: "95/100" },
  },
  {
    id: "3",
    timestamp: "2024-06-15T15:30:44.567Z",
    level: "error",
    service: "payment-service",
    message: "Payment processing failed",
    metadata: { transactionId: "txn_def456", error: "Card declined" },
  },
  {
    id: "4",
    timestamp: "2024-06-15T15:30:44.234Z",
    level: "info",
    service: "event-service",
    message: "Event created successfully",
    metadata: { eventId: "evt_ghi789" },
  },
  {
    id: "5",
    timestamp: "2024-06-15T15:30:43.901Z",
    level: "debug",
    service: "cache-service",
    message: "Cache hit for key",
    metadata: { key: "user:profile:123" },
  },
  {
    id: "6",
    timestamp: "2024-06-15T15:30:43.567Z",
    level: "info",
    service: "notification-service",
    message: "Email notification sent",
    metadata: { recipient: "user@example.com", template: "welcome" },
  },
];

const levelConfig: Record<string, { label: string; color: string }> = {
  info: { label: "INFO", color: "bg-blue-500" },
  warn: { label: "WARN", color: "bg-yellow-500" },
  error: { label: "ERROR", color: "bg-red-500" },
  debug: { label: "DEBUG", color: "bg-gray-500" },
};

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  });
}

export default function LogAggregationPage() {
  const errorCount = logEntries.filter((l) => l.level === "error").length;
  const warnCount = logEntries.filter((l) => l.level === "warn").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Log Aggregation"
        description="Centralized log management and analysis"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Total Logs (24h)"
          value="1.2M"
          icon={FileText}
        />
        <StatCard
          title="Errors"
          value={errorCount}
          valueClassName="text-red-500"
          icon={AlertTriangle}
        />
        <StatCard
          title="Warnings"
          value={warnCount}
          valueClassName="text-yellow-500"
          icon={AlertTriangle}
        />
        <StatCard
          title="Services"
          value={6}
          icon={Server}
        />
      </StatGrid>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search logs..." className="pl-9 font-mono" />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Log Stream
          </CardTitle>
          <CardDescription>Real-time log entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 font-mono text-sm">
            {logEntries.map((log) => {
              const level = levelConfig[log.level];

              return (
                <div
                  key={log.id}
                  className={`p-3 border rounded-lg ${log.level === "error" ? "border-red-500 bg-red-50 dark:bg-red-950/20" : log.level === "warn" ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-muted-foreground whitespace-nowrap">
                      {formatTimestamp(log.timestamp)}
                    </span>
                    <Badge className={`${level.color} text-white font-mono`}>
                      {level.label}
                    </Badge>
                    <Badge variant="outline" className="font-mono">
                      {log.service}
                    </Badge>
                    <span className="flex-1">{log.message}</span>
                  </div>
                  {log.metadata && (
                    <div className="mt-2 pl-24 text-xs text-muted-foreground">
                      {Object.entries(log.metadata).map(([key, value]) => (
                        <span key={key} className="mr-4">
                          <span className="text-primary">{key}</span>={value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
