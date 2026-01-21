"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Mail, Phone, MapPin, Briefcase, Loader2 } from "lucide-react";
import { EntityDetailPage } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface Person {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  role?: string;
  department?: string;
  status: string;
  location?: string;
  start_date?: string;
  avatar_url?: string;
  bio?: string;
  metadata?: Record<string, unknown>;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  active: { label: "Active", variant: "default" },
  inactive: { label: "Inactive", variant: "secondary" },
  on_leave: { label: "On Leave", variant: "outline" },
};

export default function PersonDetailPage() {
  const params = useParams();
  const personId = params.id as string;
  const [person, setPerson] = React.useState<Person | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchPerson() {
      try {
        const response = await fetch(`/api/v1/people/${personId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch person");
        }
        const result = await response.json();
        setPerson(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchPerson();
  }, [personId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-2">
        <p className="text-destructive">{error || "Person not found"}</p>
      </div>
    );
  }

  const status = statusConfig[person.status] || statusConfig.active;
  const fullName = `${person.first_name} ${person.last_name}`;
  const skills = (person.metadata?.skills as string[]) || [];
  const certifications = (person.metadata?.certifications as string[]) || [];
  const projects = (person.metadata?.projects as Array<{ id: string; name: string; role: string }>) || [];
  const recentActivity = (person.metadata?.recent_activity as Array<{ id: string; action: string; detail: string; time: string }>) || [];

  const breadcrumbs = [
    { label: "People", href: "/people" },
    { label: fullName },
  ];

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{person.bio || "No bio available"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills & Certifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {skills.length > 0 ? skills.map((skill: string) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  )) : (
                    <p className="text-sm text-muted-foreground">No skills listed</p>
                  )}
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-2">Certifications</p>
                <div className="flex flex-wrap gap-2">
                  {certifications.length > 0 ? certifications.map((cert: string) => (
                    <Badge key={cert} variant="outline">{cert}</Badge>
                  )) : (
                    <p className="text-sm text-muted-foreground">No certifications listed</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "projects",
      label: "Projects",
      badge: projects.length,
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Assigned Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projects.length > 0 ? projects.map((project: { id: string; name: string; role: string }) => (
                <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{project.name}</span>
                  </div>
                  <Badge variant="outline">{project.role}</Badge>
                </div>
              )) : (
                <p className="text-muted-foreground">No projects assigned</p>
              )}
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      id: "activity",
      label: "Activity",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? recentActivity.map((activity: { id: string; action: string; detail: string; time: string }) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">{activity.action}</span>: {activity.detail}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              )) : (
                <p className="text-muted-foreground">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      ),
    },
  ];

  const sidebarContent = (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-20 w-20 mb-4">
              <AvatarImage src={person.avatar_url} />
              <AvatarFallback className="text-xl">
                {person.first_name[0]}{person.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-lg">{fullName}</h3>
            <p className="text-sm text-muted-foreground">{person.role || "No role"}</p>
            <Badge className="mt-2" variant={status.variant}>{status.label}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{person.email || "N/A"}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{person.phone || "N/A"}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{person.location || "N/A"}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Department</span>
            <span className="text-sm font-medium">{person.department || "N/A"}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Start Date</span>
            <span className="text-sm font-medium">{person.start_date ? new Date(person.start_date).toLocaleDateString() : "N/A"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <EntityDetailPage
      title={fullName}
      subtitle={person.role || "Team Member"}
      status={{ label: status.label, variant: status.variant }}
      breadcrumbs={breadcrumbs}
      backHref="/people"
      editHref={`/people/${personId}/edit`}
      onDelete={() => console.log("Delete person")}
      tabs={tabs}
      defaultTab="overview"
      sidebarContent={sidebarContent}
    />
  );
}
