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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Clock,
  Calendar,
  Users,
  Settings,
} from "lucide-react";

const weeklySchedule = [
  { day: "Monday", available: true, start: "9:00 AM", end: "5:00 PM" },
  { day: "Tuesday", available: true, start: "9:00 AM", end: "5:00 PM" },
  { day: "Wednesday", available: true, start: "9:00 AM", end: "5:00 PM" },
  { day: "Thursday", available: true, start: "9:00 AM", end: "5:00 PM" },
  { day: "Friday", available: true, start: "9:00 AM", end: "3:00 PM" },
  { day: "Saturday", available: false, start: "", end: "" },
  { day: "Sunday", available: false, start: "", end: "" },
];

const upcomingTimeOff = [
  { id: "1", type: "Vacation", start: "Jul 1, 2024", end: "Jul 5, 2024", status: "approved" },
  { id: "2", type: "Personal", start: "Jul 15, 2024", end: "Jul 15, 2024", status: "pending" },
];

const teamAvailability = [
  { name: "Sarah Chen", status: "available", until: "" },
  { name: "Mike Johnson", status: "busy", until: "2:00 PM" },
  { name: "Emily Watson", status: "away", until: "Tomorrow" },
  { name: "David Park", status: "available", until: "" },
];

export default function CalendarAvailabilityPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Availability</h1>
          <p className="text-muted-foreground">
            Manage your availability and working hours
          </p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Working Hours
            </CardTitle>
            <CardDescription>Set your regular availability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklySchedule.map((day) => (
                <div key={day.day} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-4">
                    <Switch checked={day.available} />
                    <span className={day.available ? "font-medium" : "text-muted-foreground"}>
                      {day.day}
                    </span>
                  </div>
                  {day.available ? (
                    <span className="text-sm text-muted-foreground">
                      {day.start} - {day.end}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unavailable</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Time Off
            </CardTitle>
            <CardDescription>Upcoming scheduled time off</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTimeOff.map((timeOff) => (
                <div key={timeOff.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{timeOff.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {timeOff.start} - {timeOff.end}
                    </p>
                  </div>
                  <Badge variant={timeOff.status === "approved" ? "default" : "secondary"}>
                    {timeOff.status}
                  </Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                Request Time Off
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Availability
          </CardTitle>
          <CardDescription>Current status of team members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {teamAvailability.map((member) => (
              <div key={member.name} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  member.status === "available" ? "bg-green-500" :
                  member.status === "busy" ? "bg-yellow-500" : "bg-gray-400"
                }`} />
                <div>
                  <p className="font-medium text-sm">{member.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {member.status}
                    {member.until && ` until ${member.until}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-decline meetings outside working hours</Label>
                <p className="text-sm text-muted-foreground">Automatically decline invites outside your schedule</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Show availability to team</Label>
                <p className="text-sm text-muted-foreground">Let team members see your calendar availability</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Buffer time between meetings</Label>
                <p className="text-sm text-muted-foreground">Add 15 minutes between scheduled meetings</p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
