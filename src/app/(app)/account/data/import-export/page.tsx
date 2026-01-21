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
  Upload,
  Download,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Database,
  Users,
  Folder,
  ListTodo,
} from "lucide-react";

interface ImportExportJob {
  id: string;
  name: string;
  type: "import" | "export";
  dataType: "events" | "contacts" | "inventory" | "financial" | "all";
  format: "csv" | "xlsx" | "json" | "xml";
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  recordsProcessed: number;
  totalRecords: number;
  startedAt: string;
  completedAt?: string;
  initiatedBy: string;
  fileSize?: string;
  errorMessage?: string;
}

const jobs: ImportExportJob[] = [
  {
    id: "1",
    name: "Contact List Export",
    type: "export",
    dataType: "contacts",
    format: "csv",
    status: "completed",
    progress: 100,
    recordsProcessed: 2450,
    totalRecords: 2450,
    startedAt: "2024-06-15T10:00:00",
    completedAt: "2024-06-15T10:02:30",
    initiatedBy: "Sarah Chen",
    fileSize: "1.2 MB",
  },
  {
    id: "2",
    name: "Vendor Import",
    type: "import",
    dataType: "contacts",
    format: "xlsx",
    status: "processing",
    progress: 65,
    recordsProcessed: 130,
    totalRecords: 200,
    startedAt: "2024-06-15T14:30:00",
    initiatedBy: "Mike Johnson",
  },
  {
    id: "3",
    name: "Full Data Backup",
    type: "export",
    dataType: "all",
    format: "json",
    status: "completed",
    progress: 100,
    recordsProcessed: 45000,
    totalRecords: 45000,
    startedAt: "2024-06-14T02:00:00",
    completedAt: "2024-06-14T02:45:00",
    initiatedBy: "System",
    fileSize: "125 MB",
  },
  {
    id: "4",
    name: "Event History Import",
    type: "import",
    dataType: "events",
    format: "csv",
    status: "failed",
    progress: 35,
    recordsProcessed: 70,
    totalRecords: 200,
    startedAt: "2024-06-13T11:00:00",
    initiatedBy: "Admin",
    errorMessage: "Invalid date format in row 71",
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "bg-gray-500", icon: Clock },
  processing: { label: "Processing", color: "bg-blue-500", icon: Clock },
  completed: { label: "Completed", color: "bg-green-500", icon: CheckCircle },
  failed: { label: "Failed", color: "bg-red-500", icon: AlertTriangle },
};

const dataTypeConfig: Record<string, { label: string; icon: React.ElementType }> = {
  events: { label: "Events", icon: Calendar },
  contacts: { label: "Contacts", icon: Users },
  inventory: { label: "Inventory", icon: Folder },
  financial: { label: "Financial", icon: FileText },
  all: { label: "All Data", icon: Database },
};

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export default function ImportExportPage() {
  const completedJobs = jobs.filter((j) => j.status === "completed").length;
  const processingJobs = jobs.filter((j) => j.status === "processing").length;
  const failedJobs = jobs.filter((j) => j.status === "failed").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Import / Export"
        description="Import and export data in various formats"
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Import Data
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </div>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Total Jobs"
          value={jobs.length}
          icon={ListTodo}
        />
        <StatCard
          title="Completed"
          value={completedJobs}
          valueClassName="text-green-500"
          icon={CheckCircle}
        />
        <StatCard
          title="Processing"
          value={processingJobs}
          valueClassName="text-blue-500"
          icon={Clock}
        />
        <StatCard
          title="Failed"
          value={failedJobs}
          valueClassName="text-red-500"
          icon={AlertTriangle}
        />
      </StatGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Quick Import
            </CardTitle>
            <CardDescription>Import data from external sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-20 flex-col">
                <Users className="h-6 w-6 mb-2" />
                Contacts
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Calendar className="h-6 w-6 mb-2" />
                Events
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Folder className="h-6 w-6 mb-2" />
                Inventory
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <FileText className="h-6 w-6 mb-2" />
                Financial
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Quick Export
            </CardTitle>
            <CardDescription>Export data in various formats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-20 flex-col">
                <Database className="h-6 w-6 mb-2" />
                Full Backup
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Users className="h-6 w-6 mb-2" />
                Contacts
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Calendar className="h-6 w-6 mb-2" />
                Events
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <FileText className="h-6 w-6 mb-2" />
                Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
          <CardDescription>Import and export history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobs.map((job) => {
              const status = statusConfig[job.status];
              const dataType = dataTypeConfig[job.dataType];
              const StatusIcon = status.icon;
              const DataTypeIcon = dataType.icon;

              return (
                <div key={job.id} className={`p-4 border rounded-lg ${job.status === "failed" ? "border-red-500" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${job.type === "import" ? "bg-blue-100" : "bg-green-100"}`}>
                        {job.type === "import" ? (
                          <Upload className={`h-5 w-5 ${job.type === "import" ? "text-blue-600" : "text-green-600"}`} />
                        ) : (
                          <Download className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{job.name}</h4>
                          <Badge className={`${status.color} text-white`}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {status.label}
                          </Badge>
                          <Badge variant="outline" className="uppercase text-xs">
                            {job.format}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <DataTypeIcon className="h-4 w-4" />
                            {dataType.label}
                          </span>
                          <span>Started: {formatDateTime(job.startedAt)}</span>
                          <span>By: {job.initiatedBy}</span>
                          {job.fileSize && <span>Size: {job.fileSize}</span>}
                        </div>

                        {job.errorMessage && (
                          <p className="text-sm text-red-500 mt-2">{job.errorMessage}</p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatNumber(job.recordsProcessed)} / {formatNumber(job.totalRecords)}
                      </p>
                      <p className="text-xs text-muted-foreground">records</p>
                    </div>
                  </div>

                  {job.status === "processing" && (
                    <div className="mt-3">
                      <Progress value={job.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1 text-right">{job.progress}%</p>
                    </div>
                  )}

                  {job.status === "completed" && (
                    <div className="mt-3 flex justify-end">
                      <Button variant="outline" size="sm">
                        <Download className="mr-1 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  )}

                  {job.status === "failed" && (
                    <div className="mt-3 flex justify-end gap-2">
                      <Button variant="outline" size="sm">View Details</Button>
                      <Button size="sm">Retry</Button>
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
