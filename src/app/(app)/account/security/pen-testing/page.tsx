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
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  Shield,
  AlertTriangle,
  Clock,
  FileText,
  ExternalLink,
  CheckCircle,
  Search,
  Percent,
} from "lucide-react";

interface PenTestReport {
  id: string;
  name: string;
  vendor: string;
  status: "completed" | "in_progress" | "scheduled";
  severity: "critical" | "high" | "medium" | "low" | "none";
  findings: number;
  remediated: number;
  date: string;
}

const penTestReports: PenTestReport[] = [
  {
    id: "1",
    name: "Q2 2024 External Penetration Test",
    vendor: "SecureTest Inc.",
    status: "completed",
    severity: "medium",
    findings: 5,
    remediated: 4,
    date: "2024-06-01",
  },
  {
    id: "2",
    name: "Q1 2024 Internal Network Assessment",
    vendor: "CyberAudit Pro",
    status: "completed",
    severity: "low",
    findings: 3,
    remediated: 3,
    date: "2024-03-15",
  },
  {
    id: "3",
    name: "API Security Assessment",
    vendor: "SecureTest Inc.",
    status: "completed",
    severity: "high",
    findings: 8,
    remediated: 7,
    date: "2024-04-20",
  },
  {
    id: "4",
    name: "Q3 2024 External Penetration Test",
    vendor: "SecureTest Inc.",
    status: "scheduled",
    severity: "none",
    findings: 0,
    remediated: 0,
    date: "2024-09-01",
  },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  completed: { label: "Completed", color: "bg-green-500" },
  in_progress: { label: "In Progress", color: "bg-blue-500" },
  scheduled: { label: "Scheduled", color: "bg-gray-500" },
};

const severityConfig: Record<string, { label: string; color: string }> = {
  critical: { label: "Critical", color: "bg-red-600" },
  high: { label: "High", color: "bg-red-500" },
  medium: { label: "Medium", color: "bg-yellow-500" },
  low: { label: "Low", color: "bg-blue-500" },
  none: { label: "N/A", color: "bg-gray-500" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PenetrationTestingPage() {
  const completedTests = penTestReports.filter((r) => r.status === "completed").length;
  const totalFindings = penTestReports.reduce((acc, r) => acc + r.findings, 0);
  const totalRemediated = penTestReports.reduce((acc, r) => acc + r.remediated, 0);
  const remediationRate = totalFindings > 0 ? Math.round((totalRemediated / totalFindings) * 100) : 100;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Penetration Testing"
        description="Security assessments and vulnerability reports"
        actions={
          <Button>
            <ExternalLink className="mr-2 h-4 w-4" />
            Schedule Test
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Tests Completed"
          value={completedTests}
          icon={Shield}
        />
        <StatCard
          title="Total Findings"
          value={totalFindings}
          icon={Search}
        />
        <StatCard
          title="Remediated"
          value={totalRemediated}
          valueClassName="text-green-500"
          icon={CheckCircle}
        />
        <StatCard
          title="Remediation Rate"
          value={`${remediationRate}%`}
          icon={Percent}
        />
      </StatGrid>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Test Reports
          </CardTitle>
          <CardDescription>Penetration test history and findings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {penTestReports.map((report) => {
              const status = statusConfig[report.status];
              const severity = severityConfig[report.severity];
              const remediationProgress = report.findings > 0 
                ? Math.round((report.remediated / report.findings) * 100) 
                : 100;

              return (
                <div key={report.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium">{report.name}</h4>
                        <Badge className={`${status.color} text-white`}>
                          {status.label}
                        </Badge>
                        {report.severity !== "none" && (
                          <Badge className={`${severity.color} text-white`}>
                            {severity.label} Severity
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Vendor: {report.vendor} • Date: {formatDate(report.date)}
                      </p>
                      
                      {report.status === "completed" && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Remediation Progress</span>
                            <span>{report.remediated}/{report.findings} findings resolved</span>
                          </div>
                          <Progress value={remediationProgress} className="h-2" />
                        </div>
                      )}

                      {report.status === "scheduled" && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Scheduled for {formatDate(report.date)}
                        </div>
                      )}
                    </div>

                    {report.status === "completed" && (
                      <Button variant="outline" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        View Report
                      </Button>
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
          <CardTitle>Open Findings</CardTitle>
          <CardDescription>Vulnerabilities pending remediation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg border-yellow-500">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium">Outdated TLS Configuration</p>
                  <p className="text-sm text-muted-foreground">From: Q2 2024 External Penetration Test</p>
                </div>
              </div>
              <Badge className="bg-yellow-500 text-white">Medium</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg border-red-500">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium">Missing Rate Limiting on API Endpoint</p>
                  <p className="text-sm text-muted-foreground">From: API Security Assessment</p>
                </div>
              </div>
              <Badge className="bg-red-500 text-white">High</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
