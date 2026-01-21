"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { EntityFormPage, FormField, FormRow } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/components/ui/use-toast";

export default function NewEventPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    status: "draft",
    type: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    venueName: "",
    venueAddress: "",
    clientId: "",
    budget: 0,
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const updateField = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast({ title: "Error", description: "Event name is required.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({ title: "Event created", description: "Your new event has been created." });
      router.push("/events");
    } catch {
      toast({ title: "Error", description: "Failed to create event.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbs = [
    { label: "Events", href: "/events" },
    { label: "New Event" },
  ];

  const sections = [
    {
      id: "basic",
      title: "Event Details",
      content: (
        <div className="space-y-4">
          <FormField label="Event Name" required>
            <Input value={formData.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Event name" autoFocus />
          </FormField>
          <FormField label="Description">
            <Textarea value={formData.description} onChange={(e) => updateField("description", e.target.value)} rows={3} placeholder="Brief description..." />
          </FormField>
          <FormRow>
            <FormField label="Type" required>
              <Select value={formData.type} onValueChange={(v) => updateField("type", v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="concert">Concert</SelectItem>
                  <SelectItem value="festival">Festival</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Client">
              <Select value={formData.clientId} onValueChange={(v) => updateField("clientId", v)}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="client-001">Festival Productions Inc.</SelectItem>
                  <SelectItem value="client-002">Corporate Events Ltd.</SelectItem>
                  <SelectItem value="client-003">Private Client</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Start Date">
              <DatePicker date={formData.startDate} onDateChange={(date) => updateField("startDate", date)} />
            </FormField>
            <FormField label="End Date">
              <DatePicker date={formData.endDate} onDateChange={(date) => updateField("endDate", date)} />
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
            <Input value={formData.venueName} onChange={(e) => updateField("venueName", e.target.value)} placeholder="Venue name" />
          </FormField>
          <FormField label="Address">
            <Input value={formData.venueAddress} onChange={(e) => updateField("venueAddress", e.target.value)} placeholder="Full address" />
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
            <Input type="number" value={formData.budget || ""} onChange={(e) => updateField("budget", Number(e.target.value))} placeholder="0" />
          </FormField>
          <FormField label="Notes">
            <Textarea value={formData.notes} onChange={(e) => updateField("notes", e.target.value)} rows={4} placeholder="Additional notes..." />
          </FormField>
        </div>
      ),
    },
  ];

  return (
    <EntityFormPage
      title="New Event"
      breadcrumbs={breadcrumbs}
      backHref="/events"
      isNew
      sections={sections}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
