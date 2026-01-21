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
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Play,
  FileText,
} from "lucide-react";

interface ScanResult {
  id: string;
  type: string;
  status: "passed" | "warning" | "failed";
  findings: number;
  lastScan: string;
  nextScan: string;
}

const scanResults: ScanResult[] = [
  {
    id: "1",
    type: "Vulnerability Scan",
    status: "passed",
    findings: 0,
    lastScan: "2024-06-15T10:00:00",
    nextScan: "2024-06-22T10:00:00",
  },
  {
    id: "2",
    type: "Dependency Audit",
    status: "warning",
    findings: 3,
    lastScan: "2024-06-15T08:00:00",
    nextScan: "2024-06-16T08:00:00",
  },
  {
    id: "3",
    type: "Code Analysis",
    status: "passed",
    findings: 0,
    lastScan: "2024-06-14T22:00:00",
    nextScan: "2024-06-15T22:00:00",
  },
  {
    id: "4",
    type: "Container Scan",
    status: "passed",
    findings: 0,
    lastScan: "2024-06-15T06:00:00",
    nextScan: "2024-06-16T06:00:00",
  },
  {
    id: "5",
    type: "Secret Detection",
    status: "passed",
    findings: 0,
    lastScan: "2024-06-15T12:00:00",
    nextScan: "2024-06-15T18:00:00",
  },
];

const vulnerabilities = [
  { severity: "critical", count: 0 },
  { severity: "high", count: 0 },
  { severity: "medium", count: 2 },
  { severity: "low", count: 1 },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  passed: { label: "Passed", color: "bg-green-500", icon: CheckCircle },
  warning: { label: "Warning", color: "bg-yellow-500", icon: AlertTriangle },
  failed: { label: "Failed", color: "bg-red-500", icon: AlertTriangle },
};

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SecurityScanningPage() {
  const passedScans = scanResults.filter((s) => s.status === "passed").length;
  const totalFindings = scanResults.reduce((acc, s) => acc + s.findings, 0);
  const securityScore = Math.round((passedScans / scanResults.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Scanning</h1>
          <p className="text-muted-foreground">
            Automated security scans and vulnerability detection
          </p>
        </div>
        <Button>
          <Play className="mr-2 h-4 w-4" />
          Run All Scans
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Security Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{securityScore}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Scans Passed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{passedScans}/{scanResults.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Findings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{totalFindings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last Full Scan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">June 15, 2024</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Scan Results
            </CardTitle>
            <CardDescription>Latest security scan status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scanResults.map((scan) => {
                const status = statusConfig[scan.status];
                const StatusIcon = status.icon;

                return (
                  <div key={scan.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <StatusIcon className={`h-5 w-5 ${scan.status === "passed" ? "text-green-500" : scan.status === "warning" ? "text-yellow-500" : "text-red-500"}`} />
                      <div>
                        <p className="font-medium">{scan.type}</p>
                        <p className="text-xs text-muted-foreground">
                          Last: {formatDateTime(scan.lastScan)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {scan.findings > 0 && (
                        <Badge className="bg-yellow-500 text-white">
                          {scan.findings} findings
                        </Badge>
                      )}
                      <Badge className={`${status.color} text-white`}>
                        {status.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Vulnerability Summary
            </CardTitle>
            <CardDescription>Findings by severity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {vulnerabilities.map((vuln, idx) => {
              const colors: Record<string, string> = {
                critical: "bg-red-600",
                high: "bg-red-500",
                medium: "bg-yellow-500",
                low: "bg-blue-500",
              };

              return (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="capitalize font-medium">{vuln.severity}</span>
                    <Badge className={`${colors[vuln.severity]} text-white`}>
                      {vuln.count}
                    </Badge>
                  </div>
                  <Progress value={vuln.count > 0 ? Math.min(vuln.count * 20, 100) : 0} className="h-2" />
                </div>
              );
            })}

            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                View Full Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scan Schedule</CardTitle>
          <CardDescription>Automated scan configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {scanResults.map((scan) => (
              <div key={scan.id} className="p-4 border rounded-lg">
                <h4 className="font-medium">{scan.type}</h4>
                <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Next scan: {formatDateTime(scan.nextScan)}
                </div>
                <Button variant="outline" size="sm" className="mt-3">
                  <Play className="mr-2 h-3 w-3" />
                  Run Now
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
