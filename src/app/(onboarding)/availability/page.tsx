"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Calendar, ArrowRight, ArrowLeft, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useOnboarding } from "../layout";
import { onboardingService } from "@/lib/services/onboarding.service";

interface BlockedDate {
  id: string;
  start: string;
  end: string;
  reason: string;
}

const daysOfWeek = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

export default function AvailabilityPage() {
  const router = useRouter();
  const { userId, organizationId, refreshProgress } = useOnboarding();

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Weekly availability
  const [weeklyAvailability, setWeeklyAvailability] = React.useState<Record<string, boolean>>({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  });

  // Blocked dates
  const [blockedDates, setBlockedDates] = React.useState<BlockedDate[]>([]);

  React.useEffect(() => {
    async function initialize() {
      if (!userId) return;

      await onboardingService.startStep(userId, "availability", organizationId || undefined);
      setIsLoading(false);
    }

    initialize();
  }, [userId, organizationId]);

  function toggleDay(day: string) {
    setWeeklyAvailability((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  }

  function addBlockedDate() {
    const today = new Date().toISOString().split("T")[0];
    setBlockedDates([
      ...blockedDates,
      { id: Date.now().toString(), start: today, end: today, reason: "" },
    ]);
  }

  function removeBlockedDate(id: string) {
    setBlockedDates(blockedDates.filter((d) => d.id !== id));
  }

  function updateBlockedDate(id: string, field: keyof BlockedDate, value: string) {
    setBlockedDates(
      blockedDates.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!userId) return;

    setIsSubmitting(true);

    await onboardingService.completeStep(
      userId,
      "availability",
      { weeklyAvailability, blockedDates },
      organizationId || undefined
    );

    await refreshProgress();

    const nextStep = await onboardingService.getNextStep(userId, organizationId || undefined);
    if (nextStep) {
      router.push(`/onboarding/${nextStep.slug}`);
    } else {
      router.push("/onboarding/complete");
    }
  }

  async function handleSkip() {
    if (!userId) return;

    setIsSubmitting(true);
    await onboardingService.skipStep(userId, "availability", organizationId || undefined);
    await refreshProgress();

    const nextStep = await onboardingService.getNextStep(userId, organizationId || undefined);
    if (nextStep) {
      router.push(`/onboarding/${nextStep.slug}`);
    } else {
      router.push("/onboarding/complete");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const availableDays = Object.entries(weeklyAvailability).filter(([, v]) => v).length;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 mb-4">
          <Calendar className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Set Your Availability</h1>
        <p className="text-lg text-muted-foreground">
          Let us know when you&apos;re typically available so we can match you with the right assignments.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Weekly Availability */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Availability</CardTitle>
            <CardDescription>
              Select the days you&apos;re generally available to work
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {daysOfWeek.map((day) => (
              <div key={day.key} className="flex items-center justify-between">
                <Label htmlFor={day.key} className="font-medium">
                  {day.label}
                </Label>
                <Switch
                  id={day.key}
                  checked={weeklyAvailability[day.key]}
                  onCheckedChange={() => toggleDay(day.key)}
                  disabled={isSubmitting}
                />
              </div>
            ))}
            <div className="pt-4 border-t">
              <Badge variant="secondary">
                {availableDays} day{availableDays !== 1 ? "s" : ""} per week
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Blocked Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Blocked Dates</CardTitle>
            <CardDescription>
              Add any dates you know you won&apos;t be available (vacations, commitments, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {blockedDates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No blocked dates added yet
              </p>
            ) : (
              blockedDates.map((blocked) => (
                <div key={blocked.id} className="flex gap-3 items-start p-3 rounded-lg border">
                  <div className="flex-1 grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Start Date</Label>
                      <input
                        type="date"
                        value={blocked.start}
                        onChange={(e) =>
                          updateBlockedDate(blocked.id, "start", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">End Date</Label>
                      <input
                        type="date"
                        value={blocked.end}
                        onChange={(e) =>
                          updateBlockedDate(blocked.id, "end", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Reason (optional)</Label>
                      <input
                        type="text"
                        value={blocked.reason}
                        onChange={(e) =>
                          updateBlockedDate(blocked.id, "reason", e.target.value)
                        }
                        placeholder="e.g., Vacation"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBlockedDate(blocked.id)}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addBlockedDate}
              disabled={isSubmitting}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Blocked Date
            </Button>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              Skip for now
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
