"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useOnboarding } from "../layout";
import { authService } from "@/lib/services/auth.service";

export default function CompletePage() {
  const router = useRouter();
  const { userId, percentComplete } = useOnboarding();
  const [isNavigating, setIsNavigating] = React.useState(false);

  React.useEffect(() => {
    // Mark onboarding as complete
    if (userId) {
      authService.markOnboardingComplete(userId);
    }
  }, [userId]);

  async function handleGoToDashboard() {
    setIsNavigating(true);
    router.push("/dashboard");
  }

  return (
    <>

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center rounded-full bg-green-500/10 p-4 mb-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">You&apos;re All Set!</h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Congratulations! You&apos;ve completed your onboarding and are ready to start using ATLVS.
          </p>
        </div>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              What&apos;s Next?
            </CardTitle>
            <CardDescription>
              Here are some things you can do to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4 space-y-2">
                <h3 className="font-medium">Explore the Dashboard</h3>
                <p className="text-sm text-muted-foreground">
                  Get an overview of your projects, tasks, and team activity.
                </p>
              </div>
              <div className="rounded-lg border p-4 space-y-2">
                <h3 className="font-medium">Create Your First Project</h3>
                <p className="text-sm text-muted-foreground">
                  Start organizing your work with projects and tasks.
                </p>
              </div>
              <div className="rounded-lg border p-4 space-y-2">
                <h3 className="font-medium">Invite Team Members</h3>
                <p className="text-sm text-muted-foreground">
                  Collaborate with your team by inviting them to join.
                </p>
              </div>
              <div className="rounded-lg border p-4 space-y-2">
                <h3 className="font-medium">Connect Integrations</h3>
                <p className="text-sm text-muted-foreground">
                  Sync with your favorite tools like calendars and accounting.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Stats */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Profile completion: <span className="font-medium text-foreground">{percentComplete}%</span>
          </p>
          <p className="text-xs text-muted-foreground">
            You can always complete remaining optional steps from your settings.
          </p>
        </div>

        {/* CTA */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleGoToDashboard}
            disabled={isNavigating}
            className="min-w-[200px]"
          >
            {isNavigating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
