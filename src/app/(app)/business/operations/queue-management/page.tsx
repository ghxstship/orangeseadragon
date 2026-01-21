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
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  Layers,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Loader,
} from "lucide-react";

interface Queue {
  id: string;
  name: string;
  status: "active" | "paused" | "error";
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  throughput: number;
  avgProcessTime: string;
}

const queues: Queue[] = [
  {
    id: "1",
    name: "email-notifications",
    status: "active",
    pending: 145,
    processing: 12,
    completed: 45230,
    failed: 23,
    throughput: 250,
    avgProcessTime: "1.2s",
  },
  {
    id: "2",
    name: "event-processing",
    status: "active",
    pending: 89,
    processing: 8,
    completed: 32100,
    failed: 15,
    throughput: 180,
    avgProcessTime: "2.5s",
  },
  {
    id: "3",
    name: "report-generation",
    status: "active",
    pending: 12,
    processing: 3,
    completed: 8500,
    failed: 5,
    throughput: 45,
    avgProcessTime: "15s",
  },
  {
    id: "4",
    name: "data-sync",
    status: "paused",
    pending: 234,
    processing: 0,
    completed: 12400,
    failed: 8,
    throughput: 0,
    avgProcessTime: "5s",
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: "Active", color: "bg-green-500", icon: CheckCircle },
  paused: { label: "Paused", color: "bg-yellow-500", icon: Pause },
  error: { label: "Error", color: "bg-red-500", icon: AlertTriangle },
};

export default function QueueManagementPage() {
  const totalPending = queues.reduce((acc, q) => acc + q.pending, 0);
  const totalProcessing = queues.reduce((acc, q) => acc + q.processing, 0);
  const activeQueues = queues.filter((q) => q.status === "active").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Queue Management"
        description="Monitor and manage message queues"
        actions={
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Total Queues"
          value={queues.length}
          icon={Layers}
        />
        <StatCard
          title="Active"
          value={activeQueues}
          valueClassName="text-green-500"
          icon={CheckCircle}
        />
        <StatCard
          title="Pending Jobs"
          value={totalPending}
          icon={Clock}
        />
        <StatCard
          title="Processing"
          value={totalProcessing}
          valueClassName="text-blue-500"
          icon={Loader}
        />
      </StatGrid>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Message Queues
          </CardTitle>
          <CardDescription>All managed queues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {queues.map((queue) => {
              const status = statusConfig[queue.status];
              const StatusIcon = status.icon;
              const failRate = queue.completed > 0 ? ((queue.failed / (queue.completed + queue.failed)) * 100).toFixed(2) : "0";

              return (
                <div key={queue.id} className={`p-4 border rounded-lg ${queue.status === "paused" ? "border-yellow-500" : queue.status === "error" ? "border-red-500" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-mono font-medium">{queue.name}</h4>
                        <Badge className={`${status.color} text-white`}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {status.label}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-5 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Pending</p>
                          <p className="text-xl font-bold">{queue.pending}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Processing</p>
                          <p className="text-xl font-bold text-blue-500">{queue.processing}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Completed</p>
                          <p className="text-xl font-bold text-green-500">{(queue.completed / 1000).toFixed(1)}K</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Failed</p>
                          <p className="text-xl font-bold text-red-500">{queue.failed}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Throughput</p>
                          <p className="text-xl font-bold">{queue.throughput}/min</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Avg: {queue.avgProcessTime}
                        </span>
                        <span>Fail rate: {failRate}%</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {queue.status === "active" ? (
                        <Button variant="outline" size="sm">
                          <Pause className="mr-2 h-4 w-4" />
                          Pause
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm">
                          <Play className="mr-2 h-4 w-4" />
                          Resume
                        </Button>
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
