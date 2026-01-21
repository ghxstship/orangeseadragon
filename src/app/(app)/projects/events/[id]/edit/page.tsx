"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { EntityFormPage, FormField, FormRow } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface EventFormData {
  id: string;
  name: string;
  description: string;
  status: string;
  type: string;
  start_date: Date | null;
  end_date: Date | null;
  venue_name: string;
  venue_address: string;
  client_id: string;
  budget: number;
  notes: string;
}

const defaultFormData: EventFormData = {
  id: "",
  name: "",
  description: "",
  status: "draft",
  type: "concert",
  start_date: null,
  end_date: null,
  venue_name: "",
  venue_address: "",
  client_id: "",
  budget: 0,
  notes: "",
};

export default function EventEditPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const eventId = params.id as string;

  const [formData, setFormData] = React.useState<EventFormData>(defaultFormData);
  const [loading, setLoading] = React.useState(true);
  const [isDirty, setIsDirty] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await fetch(`/api/v1/events/${eventId}`);
        if (!response.ok) throw new Error("Failed to fetch event");
        const result = await response.json();
        const event = result.data;
        setFormData({
          id: event.id,
          name: event.name || "",
          description: event.description || "",
          status: event.status || "draft",
          type: event.type || "concert",
          start_date: event.start_date ? new Date(event.start_date) : null,
          end_date: event.end_date ? new Date(event.end_date) : null,
          venue_name: event.venue?.name || event.venue_name || "",
          venue_address: event.venue?.address || event.venue_address || "",
          client_id: event.client_id || "",
          budget: event.budget || 0,
          notes: event.notes || "",
        });
      } catch {
        toast({ title: "Error", description: "Failed to load event data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [eventId, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const updateField = <K extends keyof EventFormData>(field: K, value: EventFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          status: formData.status,
          type: formData.type,
          start_date: formData.start_date?.toISOString(),
          end_date: formData.end_date?.toISOString(),
          venue_name: formData.venue_name,
          venue_address: formData.venue_address,
          budget: formData.budget,
          notes: formData.notes,
        }),
      });
      if (!response.ok) throw new Error("Failed to update event");
      toast({ title: "Event updated", description: "Changes saved successfully." });
      router.push(`/events/${eventId}`);
    } catch {
      toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbs = [
    { label: "Events", href: "/events" },
    { label: formData.name || "Event", href: `/events/${eventId}` },
    { label: "Edit" },
  ];

  const sections = [
    {
      id: "basic",
      title: "Event Details",
      content: (
        <div className="space-y-4">
          <FormField label="Event Name" required>
            <Input value={formData.name} onChange={(e) => updateField("name", e.target.value)} />
          </FormField>
          <FormField label="Description">
            <Textarea value={formData.description} onChange={(e) => updateField("description", e.target.value)} rows={3} />
          </FormField>
          <FormRow>
            <FormField label="Type">
              <Select value={formData.type} onValueChange={(v) => updateField("type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="concert">Concert</SelectItem>
                  <SelectItem value="festival">Festival</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Status">
              <Select value={formData.status} onValueChange={(v) => updateField("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Start Date">
              <DatePicker date={formData.start_date ?? undefined} onDateChange={(date) => date && updateField("start_date", date)} />
            </FormField>
            <FormField label="End Date">
              <DatePicker date={formData.end_date ?? undefined} onDateChange={(date) => date && updateField("end_date", date)} />
            </FormField>
          </FormRow>
        </div>
      ),
    },
    {
      id: "venue",
      title: "Venue",
      content: (
        <div className="space-y-4">
          <FormField label="Venue Name">
            <Input value={formData.venue_name} onChange={(e) => updateField("venue_name", e.target.value)} />
          </FormField>
          <FormField label="Address">
            <Input value={formData.venue_address} onChange={(e) => updateField("venue_address", e.target.value)} />
          </FormField>
        </div>
      ),
    },
    {
      id: "budget",
      title: "Budget & Notes",
      content: (
        <div className="space-y-4">
          <FormField label="Budget">
            <Input type="number" value={formData.budget} onChange={(e) => updateField("budget", Number(e.target.value))} />
          </FormField>
          <FormField label="Notes">
            <Textarea value={formData.notes} onChange={(e) => updateField("notes", e.target.value)} rows={4} />
          </FormField>
        </div>
      ),
    },
  ];

  return (
    <EntityFormPage
      title={`Edit Event`}
      breadcrumbs={breadcrumbs}
      backHref={`/events/${eventId}`}
      sections={sections}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      isDirty={isDirty}
    />
  );
}
