"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  Calendar,
  Users,
  MapPin,
  Plus,
  Search,
  ChevronRight,
  Clock,
  Ticket,
  Star,
} from "lucide-react";

interface ConnectionEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  capacity: number;
  type: "networking" | "conference" | "meetup" | "workshop";
  status: "upcoming" | "ongoing" | "completed";
  registered: boolean;
}

const connectionEvents: ConnectionEvent[] = [
  {
    id: "1",
    name: "Networking Mixer",
    date: "Jun 25, 2024",
    time: "6:00 PM",
    location: "Downtown Hub",
    attendees: 45,
    capacity: 60,
    type: "networking",
    status: "upcoming",
    registered: true,
  },
  {
    id: "2",
    name: "Industry Conference",
    date: "Jul 10, 2024",
    time: "9:00 AM",
    location: "Convention Center",
    attendees: 200,
    capacity: 300,
    type: "conference",
    status: "upcoming",
    registered: false,
  },
  {
    id: "3",
    name: "Partner Meetup",
    date: "Jul 20, 2024",
    time: "2:00 PM",
    location: "Partner Office",
    attendees: 30,
    capacity: 40,
    type: "meetup",
    status: "upcoming",
    registered: true,
  },
  {
    id: "4",
    name: "Event Tech Workshop",
    date: "Aug 5, 2024",
    time: "10:00 AM",
    location: "Tech Campus",
    attendees: 25,
    capacity: 50,
    type: "workshop",
    status: "upcoming",
    registered: false,
  },
];

const typeConfig: Record<string, { label: string; color: string }> = {
  networking: { label: "Networking", color: "bg-blue-500" },
  conference: { label: "Conference", color: "bg-purple-500" },
  meetup: { label: "Meetup", color: "bg-green-500" },
  workshop: { label: "Workshop", color: "bg-orange-500" },
};

export default function ConnectionsEventsPage() {
  const upcomingCount = connectionEvents.filter((e) => e.status === "upcoming").length;
  const registeredCount = connectionEvents.filter((e) => e.registered).length;
  const totalAttendees = connectionEvents.reduce((acc, e) => acc + e.attendees, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Connection Events"
        description="Networking and connection events to grow your network"
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Upcoming Events"
          value={upcomingCount}
          icon={Calendar}
        />
        <StatCard
          title="Registered"
          value={registeredCount}
          valueClassName="text-green-500"
          icon={Ticket}
        />
        <StatCard
          title="Total Attendees"
          value={totalAttendees}
          icon={Users}
        />
        <StatCard
          title="This Month"
          value={2}
          icon={Star}
        />
      </StatGrid>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search events..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
          <CardDescription>Events you can attend to grow your network</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {connectionEvents.map((event) => {
              const type = typeConfig[event.type];
              const spotsLeft = event.capacity - event.attendees;

              return (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${type.color}`}>
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{event.name}</h4>
                        <Badge className={`${type.color} text-white`}>
                          {type.label}
                        </Badge>
                        {event.registered && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Registered
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{event.attendees} attending</span>
                        <span>•</span>
                        <span className={spotsLeft < 10 ? "text-orange-500" : ""}>
                          {spotsLeft} spots left
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {event.registered ? (
                      <Button variant="outline" size="sm">View Details</Button>
                    ) : (
                      <Button size="sm">Register</Button>
                    )}
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
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
