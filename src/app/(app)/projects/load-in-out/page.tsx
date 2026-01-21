"use client";

import * as React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  Search,
  Plus,
  MoreHorizontal,
  Truck,
  Clock,
  MapPin,
  CheckCircle,
  ArrowDown,
  ArrowUp,
} from "lucide-react";

interface LoadSchedule {
  id: string;
  eventName: string;
  venue: string;
  type: "load_in" | "load_out";
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number;
  status: "scheduled" | "in_progress" | "completed" | "delayed";
  trucks: number;
  crewCount: number;
  completedTasks: number;
  totalTasks: number;
  notes?: string;
}

const loadSchedules: LoadSchedule[] = [
  {
    id: "1",
    eventName: "Summer Festival 2024",
    venue: "City Arena",
    type: "load_in",
    scheduledDate: "2024-06-14",
    scheduledTime: "06:00",
    estimatedDuration: 8,
    status: "scheduled",
    trucks: 12,
    crewCount: 45,
    completedTasks: 0,
    totalTasks: 25,
    notes: "Main stage and electronic stage equipment",
  },
  {
    id: "2",
    eventName: "Summer Festival 2024",
    venue: "City Arena",
    type: "load_out",
    scheduledDate: "2024-06-16",
    scheduledTime: "23:00",
    estimatedDuration: 6,
    status: "scheduled",
    trucks: 12,
    crewCount: 50,
    completedTasks: 0,
    totalTasks: 20,
  },
  {
    id: "3",
    eventName: "Corporate Gala 2024",
    venue: "Grand Ballroom Hotel",
    type: "load_in",
    scheduledDate: "2024-03-20",
    scheduledTime: "08:00",
    estimatedDuration: 4,
    status: "in_progress",
    trucks: 3,
    crewCount: 12,
    completedTasks: 8,
    totalTasks: 15,
  },
  {
    id: "4",
    eventName: "Tech Conference 2024",
    venue: "Convention Center",
    type: "load_in",
    scheduledDate: "2024-09-09",
    scheduledTime: "07:00",
    estimatedDuration: 10,
    status: "scheduled",
    trucks: 8,
    crewCount: 30,
    completedTasks: 0,
    totalTasks: 30,
  },
  {
    id: "5",
    eventName: "Product Launch",
    venue: "Tech Hub",
    type: "load_out",
    scheduledDate: "2024-02-15",
    scheduledTime: "22:00",
    estimatedDuration: 3,
    status: "completed",
    trucks: 2,
    crewCount: 8,
    completedTasks: 10,
    totalTasks: 10,
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  scheduled: { label: "Scheduled", color: "bg-blue-500", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-yellow-500", icon: Truck },
  completed: { label: "Completed", color: "bg-green-500", icon: CheckCircle },
  delayed: { label: "Delayed", color: "bg-red-500", icon: Clock },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function LoadInOutPage() {
  const loadIns = loadSchedules.filter((l) => l.type === "load_in");
  const loadOuts = loadSchedules.filter((l) => l.type === "load_out");
  const inProgress = loadSchedules.filter((l) => l.status === "in_progress").length;
  const totalTrucks = loadSchedules.filter((l) => l.status !== "completed").reduce((acc, l) => acc + l.trucks, 0);

  const stats = {
    totalSchedules: loadSchedules.length,
    loadIns: loadIns.length,
    loadOuts: loadOuts.length,
    inProgress,
    totalTrucks,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Load In / Load Out"
        description="Manage equipment loading schedules"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Load
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Load Ins"
          value={stats.loadIns}
          valueClassName="text-green-500"
          icon={ArrowDown}
        />
        <StatCard
          title="Load Outs"
          value={stats.loadOuts}
          valueClassName="text-orange-500"
          icon={ArrowUp}
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          valueClassName="text-yellow-500"
          icon={Clock}
        />
        <StatCard
          title="Trucks Scheduled"
          value={stats.totalTrucks}
          icon={Truck}
        />
      </StatGrid>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search schedules..." className="pl-9" />
        </div>
      </div>

      <div className="space-y-4">
        {loadSchedules.map((schedule) => {
          const status = statusConfig[schedule.status];
          const StatusIcon = status.icon;
          const progress = Math.round((schedule.completedTasks / schedule.totalTasks) * 100);

          return (
            <Card key={schedule.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${schedule.type === "load_in" ? "bg-green-100" : "bg-orange-100"}`}>
                      {schedule.type === "load_in" ? (
                        <ArrowDown className="h-6 w-6 text-green-600" />
                      ) : (
                        <ArrowUp className="h-6 w-6 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{schedule.eventName}</h3>
                        <Badge className={schedule.type === "load_in" ? "bg-green-500 text-white" : "bg-orange-500 text-white"}>
                          {schedule.type === "load_in" ? "Load In" : "Load Out"}
                        </Badge>
                        <Badge className={`${status.color} text-white`}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {status.label}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {schedule.venue}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDate(schedule.scheduledDate)} at {schedule.scheduledTime}
                        </span>
                        <span>Est. {schedule.estimatedDuration}h</span>
                      </div>

                      <div className="flex items-center gap-6 mt-3">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{schedule.trucks} trucks</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">{schedule.crewCount}</span>
                          <span className="text-muted-foreground"> crew</span>
                        </div>
                      </div>

                      {schedule.notes && (
                        <p className="text-sm text-muted-foreground mt-2 italic">{schedule.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1 text-right">
                        {schedule.completedTasks}/{schedule.totalTasks} tasks
                      </p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Schedule</DropdownMenuItem>
                        <DropdownMenuItem>View Checklist</DropdownMenuItem>
                        <DropdownMenuItem>Assign Crew</DropdownMenuItem>
                        {schedule.status === "scheduled" && (
                          <DropdownMenuItem className="text-yellow-600">Start Load</DropdownMenuItem>
                        )}
                        {schedule.status === "in_progress" && (
                          <DropdownMenuItem className="text-green-600">Mark Complete</DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
