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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  Plus,
  MoreHorizontal,
  Phone,
  Calendar,
  Users,
  Clock,
} from "lucide-react";

interface OnCallShift {
  id: string;
  user: string;
  email: string;
  team: string;
  startDate: string;
  endDate: string;
  status: "current" | "upcoming" | "completed";
}

const onCallShifts: OnCallShift[] = [
  {
    id: "1",
    user: "Sarah Chen",
    email: "sarah.chen@acme.com",
    team: "Platform",
    startDate: "2024-06-15T00:00:00",
    endDate: "2024-06-22T00:00:00",
    status: "current",
  },
  {
    id: "2",
    user: "Mike Johnson",
    email: "mike.johnson@acme.com",
    team: "Platform",
    startDate: "2024-06-22T00:00:00",
    endDate: "2024-06-29T00:00:00",
    status: "upcoming",
  },
  {
    id: "3",
    user: "Emily Watson",
    email: "emily.watson@acme.com",
    team: "Platform",
    startDate: "2024-06-29T00:00:00",
    endDate: "2024-07-06T00:00:00",
    status: "upcoming",
  },
  {
    id: "4",
    user: "David Park",
    email: "david.park@acme.com",
    team: "Database",
    startDate: "2024-06-15T00:00:00",
    endDate: "2024-06-22T00:00:00",
    status: "current",
  },
  {
    id: "5",
    user: "Alex Kim",
    email: "alex.kim@acme.com",
    team: "Database",
    startDate: "2024-06-22T00:00:00",
    endDate: "2024-06-29T00:00:00",
    status: "upcoming",
  },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  current: { label: "On Call Now", color: "bg-green-500" },
  upcoming: { label: "Upcoming", color: "bg-blue-500" },
  completed: { label: "Completed", color: "bg-gray-500" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function OnCallSchedulePage() {
  const currentOnCall = onCallShifts.filter((s) => s.status === "current");
  const upcomingCount = onCallShifts.filter((s) => s.status === "upcoming").length;
  const teams = Array.from(new Set(onCallShifts.map((s) => s.team)));

  return (
    <div className="space-y-6">
      <PageHeader
        title="On-Call Schedule"
        description="Manage on-call rotations and escalations"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Shift
          </Button>
        }
      />

      <Card className="border-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-green-500" />
            Currently On Call
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {currentOnCall.map((shift) => (
              <div key={shift.id} className="flex items-center gap-4 p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-white font-medium">
                  {shift.user.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <h4 className="font-medium">{shift.user}</h4>
                  <p className="text-sm text-muted-foreground">{shift.team} Team</p>
                  <p className="text-xs text-muted-foreground">{shift.email}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <StatGrid columns={4}>
        <StatCard
          title="Teams"
          value={teams.length}
          icon={Users}
        />
        <StatCard
          title="On Call Now"
          value={currentOnCall.length}
          valueClassName="text-green-500"
          icon={Phone}
        />
        <StatCard
          title="Upcoming Shifts"
          value={upcomingCount}
          icon={Calendar}
        />
        <StatCard
          title="Rotation Length"
          value="7 days"
          icon={Clock}
        />
      </StatGrid>

      {teams.map((team) => {
        const teamShifts = onCallShifts.filter((s) => s.team === team);

        return (
          <Card key={team}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {team} Team
              </CardTitle>
              <CardDescription>On-call rotation schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teamShifts.map((shift) => {
                  const status = statusConfig[shift.status];

                  return (
                    <div key={shift.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-medium">
                          {shift.user.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{shift.user}</h4>
                            <Badge className={`${status.color} text-white`}>
                              {status.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {formatDate(shift.startDate)} - {formatDate(shift.endDate)}
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Shift</DropdownMenuItem>
                          <DropdownMenuItem>Swap Shift</DropdownMenuItem>
                          <DropdownMenuItem>View Contact</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
