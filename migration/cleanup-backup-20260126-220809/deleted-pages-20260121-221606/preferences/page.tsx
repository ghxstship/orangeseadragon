"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Settings, ArrowRight, ArrowLeft, Loader2, Bell, Moon, Sun, Monitor } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useOnboarding } from "../layout";
import { onboardingService } from "@/lib/services/onboarding.service";

export default function PreferencesPage() {
  const router = useRouter();
  const { userId, organizationId, refreshProgress } = useOnboarding();

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Theme
  const [theme, setTheme] = React.useState("system");

  // Notifications
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [pushNotifications, setPushNotifications] = React.useState(true);
  const [taskReminders, setTaskReminders] = React.useState(true);
  const [eventReminders, setEventReminders] = React.useState(true);
  const [teamUpdates, setTeamUpdates] = React.useState(true);
  const [marketingEmails, setMarketingEmails] = React.useState(false);

  React.useEffect(() => {
    async function loadPreferences() {
      if (!userId) return;

      // Mark step as in progress
      await onboardingService.startStep(userId, "preferences", organizationId || undefined);
      
      setIsLoading(false);
    }

    loadPreferences();
  }, [userId, organizationId]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!userId) return;

    setIsSubmitting(true);

    // Complete onboarding step
    await onboardingService.completeStep(
      userId,
      "preferences",
      { 
        theme,
        notifications: {
          email: emailNotifications,
          push: pushNotifications,
          taskReminders,
          eventReminders,
          teamUpdates,
          marketingEmails,
        }
      },
      organizationId || undefined
    );

    await refreshProgress();

    // Navigate to next step
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
    await onboardingService.skipStep(userId, "preferences", organizationId || undefined);
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

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 mb-4">
          <Settings className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Preferences</h1>
        <p className="text-lg text-muted-foreground">
          Customize your ATLVS experience with your preferred settings.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Theme */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Choose how ATLVS looks to you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={theme}
              onValueChange={setTheme}
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="light"
                  id="light"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="light"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Sun className="mb-3 h-6 w-6" />
                  Light
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="dark"
                  id="dark"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="dark"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Moon className="mb-3 h-6 w-6" />
                  Dark
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="system"
                  id="system"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="system"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Monitor className="mb-3 h-6 w-6" />
                  System
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Choose how you want to be notified
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Delivery Methods */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Delivery Methods</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive browser push notifications
                    </p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>
              </div>
            </div>

            {/* Notification Types */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-medium">Notification Types</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="task-reminders">Task Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminded about upcoming and overdue tasks
                    </p>
                  </div>
                  <Switch
                    id="task-reminders"
                    checked={taskReminders}
                    onCheckedChange={setTaskReminders}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="event-reminders">Event Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminded about upcoming events and deadlines
                    </p>
                  </div>
                  <Switch
                    id="event-reminders"
                    checked={eventReminders}
                    onCheckedChange={setEventReminders}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="team-updates">Team Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when team members make changes
                    </p>
                  </div>
                  <Switch
                    id="team-updates"
                    checked={teamUpdates}
                    onCheckedChange={setTeamUpdates}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing-emails">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive product updates and tips
                    </p>
                  </div>
                  <Switch
                    id="marketing-emails"
                    checked={marketingEmails}
                    onCheckedChange={setMarketingEmails}
                  />
                </div>
              </div>
            </div>
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
