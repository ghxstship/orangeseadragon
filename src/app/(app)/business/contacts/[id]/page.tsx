"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Mail, Phone, MapPin, Building2, Calendar, Loader2 } from "lucide-react";
import { EntityDetailPage } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  job_title?: string;
  contact_type?: string;
  status?: string;
  notes?: string;
  company?: { id: string; name: string };
  metadata?: Record<string, unknown>;
  created_at?: string;
}

const typeConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  client: { label: "Client", variant: "default" },
  vendor: { label: "Vendor", variant: "secondary" },
  crew: { label: "Crew", variant: "outline" },
  venue: { label: "Venue", variant: "outline" },
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" }> = {
  active: { label: "Active", variant: "default" },
  inactive: { label: "Inactive", variant: "secondary" },
};

export default function ContactDetailPage() {
  const params = useParams();
  const contactId = params.id as string;
  const [contact, setContact] = React.useState<Contact | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchContact() {
      try {
        const response = await fetch(`/api/v1/contacts/${contactId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch contact");
        }
        const result = await response.json();
        setContact(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchContact();
  }, [contactId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-2">
        <p className="text-destructive">{error || "Contact not found"}</p>
      </div>
    );
  }

  const type = typeConfig[contact.contact_type || "client"] || typeConfig.client;
  const status = statusConfig[contact.status || "active"] || statusConfig.active;
  const fullName = `${contact.first_name} ${contact.last_name}`;
  const address = (contact.metadata?.address as string) || "";
  const tags = (contact.metadata?.tags as string[]) || [];
  const lastContact = (contact.metadata?.last_contact as string) || "";
  const events = (contact.metadata?.events as Array<{ id: string; name: string; date: string; status: string }>) || [];

  const breadcrumbs = [
    { label: "Contacts", href: "/contacts" },
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
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{contact.email || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{contact.phone || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium">{contact.company?.name || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{address || "N/A"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{contact.notes || "No notes available"}</p>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "events",
      label: "Events",
      badge: events.length,
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Associated Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events.length > 0 ? events.map((event: { id: string; name: string; date: string; status: string }) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{event.name}</p>
                      <p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge variant={event.status === "upcoming" ? "default" : "secondary"}>
                    {event.status}
                  </Badge>
                </div>
              )) : (
                <p className="text-muted-foreground">No associated events</p>
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
              <AvatarFallback className="text-xl">
                {contact.first_name[0]}{contact.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-lg">{fullName}</h3>
            <p className="text-sm text-muted-foreground">{contact.job_title || ""}</p>
            <p className="text-sm text-muted-foreground">{contact.company?.name || ""}</p>
            <div className="flex gap-2 mt-3">
              <Badge variant={type.variant}>{type.label}</Badge>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tags.length > 0 ? tags.map((tag: string) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            )) : (
              <p className="text-sm text-muted-foreground">No tags</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Last Contact</p>
            <p className="text-sm">{lastContact ? new Date(lastContact).toLocaleDateString() : "N/A"}</p>
          </div>
          <Separator />
          <div>
            <p className="text-xs text-muted-foreground">Added</p>
            <p className="text-sm">{contact.created_at ? new Date(contact.created_at).toLocaleDateString() : "N/A"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <EntityDetailPage
      title={fullName}
      subtitle={`${contact.job_title || ""} at ${contact.company?.name || ""}`}
      status={{ label: type.label, variant: type.variant }}
      breadcrumbs={breadcrumbs}
      backHref="/contacts"
      editHref={`/contacts/${contactId}/edit`}
      onDelete={() => console.log("Delete contact")}
      tabs={tabs}
      defaultTab="overview"
      sidebarContent={sidebarContent}
      actions={[
        { id: "email", label: "Send Email", onClick: () => console.log("Email") },
        { id: "call", label: "Log Call", onClick: () => console.log("Call") },
      ]}
    />
  );
}
