"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  Clock,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface Shift {
  id: string;
  employeeName: string;
  role: string;
  eventName: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled";
  breakDuration: number;
}

const shifts: Shift[] = [
  {
    id: "1",
    employeeName: "John Smith",
    role: "Stage Manager",
    eventName: "Summer Festival 2024",
    location: "Main Stage",
    date: "2024-01-15",
    startTime: "06:00",
    endTime: "18:00",
    status: "confirmed",
    breakDuration: 60,
  },
  {
    id: "2",
    employeeName: "Sarah Chen",
    role: "Audio Engineer",
    eventName: "Summer Festival 2024",
    location: "Main Stage",
    date: "2024-01-15",
    startTime: "08:00",
    endTime: "20:00",
    status: "confirmed",
    breakDuration: 60,
  },
  {
    id: "3",
    employeeName: "Mike Johnson",
    role: "Lighting Tech",
    eventName: "Summer Festival 2024",
    location: "Main Stage",
    date: "2024-01-15",
    startTime: "10:00",
    endTime: "22:00",
    status: "scheduled",
    breakDuration: 60,
  },
  {
    id: "4",
    employeeName: "Emily Watson",
    role: "Event Coordinator",
    eventName: "Corporate Gala 2024",
    location: "Grand Ballroom",
    date: "2024-01-15",
    startTime: "14:00",
    endTime: "23:00",
    status: "in_progress",
    breakDuration: 30,
  },
  {
    id: "5",
    employeeName: "Tom Wilson",
    role: "AV Tech",
    eventName: "Corporate Gala 2024",
    location: "Grand Ballroom",
    date: "2024-01-15",
    startTime: "12:00",
    endTime: "22:00",
    status: "confirmed",
    breakDuration: 60,
  },
  {
    id: "6",
    employeeName: "Lisa Park",
    role: "Runner",
    eventName: "Summer Festival 2024",
    location: "Various",
    date: "2024-01-15",
    startTime: "07:00",
    endTime: "19:00",
    status: "completed",
    breakDuration: 60,
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  scheduled: { label: "Scheduled", color: "bg-gray-500", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-500", icon: CheckCircle },
  in_progress: { label: "In Progress", color: "bg-green-500", icon: Clock },
  completed: { label: "Completed", color: "bg-purple-500", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-500", icon: AlertCircle },
};

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function calculateHours(start: string, end: string, breakMins: number): number {
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  const startMins = startH * 60 + startM;
  const endMins = endH * 60 + endM;
  return (endMins - startMins - breakMins) / 60;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function ShiftsPage() {
  const [currentDate, setCurrentDate] = React.useState(new Date("2024-01-15"));

  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const totalHours = shifts.reduce((acc, s) => acc + calculateHours(s.startTime, s.endTime, s.breakDuration), 0);
  const confirmedShifts = shifts.filter((s) => s.status === "confirmed" || s.status === "in_progress").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shifts</h1>
          <p className="text-muted-foreground">
            Manage crew shift schedules
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Shift
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Shifts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shifts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{confirmedShifts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Crew Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {new Set(shifts.map((s) => s.employeeName)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Daily Schedule
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goToPreviousDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[200px] text-center">
                {formatDate(currentDate.toISOString().split("T")[0])}
              </span>
              <Button variant="outline" size="icon" onClick={goToNextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shifts.map((shift) => {
              const status = statusConfig[shift.status];
              const StatusIcon = status.icon;
              const hours = calculateHours(shift.startTime, shift.endTime, shift.breakDuration);

              return (
                <div key={shift.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{getInitials(shift.employeeName)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{shift.employeeName}</span>
                      <Badge variant="outline">{shift.role}</Badge>
                      <Badge className={`${status.color} text-white`}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{shift.eventName}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {shift.location}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2 font-mono">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{shift.startTime} - {shift.endTime}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {hours.toFixed(1)} hours ({shift.breakDuration}min break)
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
                      <DropdownMenuItem>Edit Shift</DropdownMenuItem>
                      {shift.status === "scheduled" && (
                        <DropdownMenuItem className="text-blue-600">Confirm</DropdownMenuItem>
                      )}
                      {shift.status === "confirmed" && (
                        <DropdownMenuItem className="text-green-600">Start Shift</DropdownMenuItem>
                      )}
                      {shift.status === "in_progress" && (
                        <DropdownMenuItem className="text-purple-600">Complete Shift</DropdownMenuItem>
                      )}
                      <DropdownMenuItem>Reassign</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem>
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
