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
  Calendar,
  Clock,
  Users,
  Play,
  Video,
  Bell,
} from "lucide-react";

interface Webinar {
  id: string;
  title: string;
  description: string;
  presenter: string;
  presenterRole: string;
  date: string;
  time: string;
  duration: number;
  status: "upcoming" | "live" | "recorded";
  attendees?: number;
  category: string;
}

const webinars: Webinar[] = [
  {
    id: "1",
    title: "What's New in ATLVS 2.5",
    description: "Explore the latest features and improvements in our summer release",
    presenter: "Sarah Chen",
    presenterRole: "Product Manager",
    date: "2024-06-20",
    time: "2:00 PM EST",
    duration: 60,
    status: "upcoming",
    attendees: 156,
    category: "Product Updates",
  },
  {
    id: "2",
    title: "Advanced Reporting Techniques",
    description: "Learn how to create custom reports and dashboards for your organization",
    presenter: "Mike Johnson",
    presenterRole: "Solutions Engineer",
    date: "2024-06-18",
    time: "11:00 AM EST",
    duration: 45,
    status: "live",
    attendees: 89,
    category: "Training",
  },
  {
    id: "3",
    title: "Event Planning Best Practices",
    description: "Tips and tricks from industry experts on planning successful events",
    presenter: "Emily Watson",
    presenterRole: "Customer Success",
    date: "2024-06-15",
    time: "3:00 PM EST",
    duration: 60,
    status: "recorded",
    attendees: 234,
    category: "Best Practices",
  },
  {
    id: "4",
    title: "API Integration Workshop",
    description: "Hands-on workshop for developers integrating with the ATLVS API",
    presenter: "David Park",
    presenterRole: "Developer Advocate",
    date: "2024-06-10",
    time: "1:00 PM EST",
    duration: 90,
    status: "recorded",
    attendees: 78,
    category: "Developer",
  },
  {
    id: "5",
    title: "Financial Management Deep Dive",
    description: "Master budgeting, invoicing, and financial reporting in ATLVS",
    presenter: "Alex Kim",
    presenterRole: "Finance Specialist",
    date: "2024-06-25",
    time: "10:00 AM EST",
    duration: 60,
    status: "upcoming",
    attendees: 92,
    category: "Training",
  },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  upcoming: { label: "Upcoming", color: "bg-blue-500" },
  live: { label: "Live Now", color: "bg-red-500" },
  recorded: { label: "Recorded", color: "bg-gray-500" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function WebinarsPage() {
  const upcomingCount = webinars.filter((w) => w.status === "upcoming").length;
  const liveCount = webinars.filter((w) => w.status === "live").length;
  const recordedCount = webinars.filter((w) => w.status === "recorded").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Webinars</h1>
          <p className="text-muted-foreground">
            Live sessions and recorded training
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Webinars
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{webinars.length}</div>
          </CardContent>
        </Card>
        <Card className={liveCount > 0 ? "border-red-500" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Live Now
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{liveCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{upcomingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recorded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recordedCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search webinars..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Webinars</CardTitle>
          <CardDescription>Live and recorded sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {webinars.map((webinar) => {
              const status = statusConfig[webinar.status];

              return (
                <div key={webinar.id} className={`p-4 border rounded-lg ${webinar.status === "live" ? "border-red-500 bg-red-50 dark:bg-red-950/20" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${webinar.status === "live" ? "bg-red-500" : "bg-muted"}`}>
                        <Video className={`h-6 w-6 ${webinar.status === "live" ? "text-white" : ""}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium">{webinar.title}</h4>
                          <Badge className={`${status.color} text-white`}>
                            {status.label}
                          </Badge>
                          <Badge variant="outline">{webinar.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {webinar.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{webinar.presenter} • {webinar.presenterRole}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(webinar.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {webinar.time} ({webinar.duration} min)
                          </span>
                          {webinar.attendees && (
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {webinar.attendees} {webinar.status === "recorded" ? "watched" : "registered"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      {webinar.status === "live" && (
                        <Button className="bg-red-500 hover:bg-red-600">
                          <Play className="mr-2 h-4 w-4" />
                          Join Now
                        </Button>
                      )}
                      {webinar.status === "upcoming" && (
                        <Button variant="outline">
                          <Bell className="mr-2 h-4 w-4" />
                          Register
                        </Button>
                      )}
                      {webinar.status === "recorded" && (
                        <Button variant="outline">
                          <Play className="mr-2 h-4 w-4" />
                          Watch
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
