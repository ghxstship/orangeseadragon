"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Calendar, MapPin, Users, Clock, DollarSign, Loader2 } from "lucide-react";
import { EntityDetailPage } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface Event {
  id: string;
  name: string;
  description?: string;
  status: string;
  event_type?: string;
  start_date: string;
  end_date: string;
  venue?: { id: string; name: string; address?: string };
  organization?: { id: string; name: string };
  budget?: number;
  capacity?: number;
  metadata?: Record<string, unknown>;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  draft: { label: "Draft", variant: "secondary" },
  pending: { label: "Pending", variant: "outline" },
  confirmed: { label: "Confirmed", variant: "default" },
  in_progress: { label: "In Progress", variant: "default" },
  completed: { label: "Completed", variant: "secondary" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [event, setEvent] = React.useState<Event | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await fetch(`/api/v1/events/${eventId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch event");
        }
        const result = await response.json();
        setEvent(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-2">
        <p className="text-destructive">{error || "Event not found"}</p>
      </div>
    );
  }

  const status = statusConfig[event.status] || statusConfig.draft;
  const budget = event.budget || 0;
  const spent = (event.metadata?.spent as number) || 0;
  const budgetUsed = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const tasksTotal = (event.metadata?.tasks_total as number) || 0;
  const tasksCompleted = (event.metadata?.tasks_completed as number) || 0;
  const taskProgress = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;
  const crew = (event.metadata?.crew as Array<{ id: string; name: string; role: string }>) || [];

  const breadcrumbs = [
    { label: "Events", href: "/events" },
    { label: event.name },
  ];

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{event.description || "No description available"}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Dates</p>
                    <p className="font-medium">
                      {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Venue</p>
                    <p className="font-medium">{event.venue?.name || "TBD"}</p>
                    <p className="text-sm text-muted-foreground">{event.venue?.address || ""}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Spent</span>
                    <span className="font-medium">${spent.toLocaleString()} / ${budget.toLocaleString()}</span>
                  </div>
                  <Progress value={budgetUsed} />
                  <p className="text-sm text-muted-foreground">{budgetUsed}% of budget used</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-medium">{tasksCompleted} / {tasksTotal}</span>
                  </div>
                  <Progress value={taskProgress} />
                  <p className="text-sm text-muted-foreground">{taskProgress}% complete</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: "crew",
      label: "Crew",
      badge: crew.length,
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Assigned Crew</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {crew.length > 0 ? crew.map((member: { id: string; name: string; role: string }) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{member.name.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-muted-foreground">No crew assigned yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      id: "notes",
      label: "Notes",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Event Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{(event.metadata?.notes as string) || "No notes available"}</p>
          </CardContent>
        </Card>
      ),
    },
  ];

  const sidebarContent = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Type</span>
            <Badge variant="outline" className="capitalize">{event.event_type || "general"}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organization</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium">{event.organization?.name || "N/A"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{crew.length} crew members</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">${budget.toLocaleString()} budget</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{event.capacity || 0} capacity</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <EntityDetailPage
      title={event.name}
      subtitle={`${event.venue?.name || "TBD"} • ${new Date(event.start_date).toLocaleDateString()}`}
      status={{ label: status.label, variant: status.variant }}
      breadcrumbs={breadcrumbs}
      backHref="/events"
      editHref={`/events/${eventId}/edit`}
      onDelete={() => console.log("Delete event")}
      onShare={() => console.log("Share event")}
      tabs={tabs}
      defaultTab="overview"
      sidebarContent={sidebarContent}
      actions={[
        { id: "duplicate", label: "Duplicate", onClick: () => console.log("Duplicate") },
        { id: "export", label: "Export", onClick: () => console.log("Export") },
      ]}
    />
  );
}
