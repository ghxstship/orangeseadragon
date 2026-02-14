"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle, ArrowRight, Rocket, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OnboardingCompletePage() {
  return (
    <div className="space-y-8 text-center">
      {/* Success icon */}
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-semantic-success/15 dark:bg-semantic-success/25">
        <CheckCircle className="h-10 w-10 text-semantic-success" />
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">You&apos;re all set!</h1>
        <p className="text-lg text-muted-foreground">
          Your workspace is ready. Let&apos;s start building something amazing.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 md:grid-cols-2 text-left">
        <Link href="/productions/events/new">
          <div className="rounded-lg border p-4 hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Rocket className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Create your first project</p>
                <p className="text-sm text-muted-foreground">
                  Start organizing your work
                </p>
              </div>
            </div>
          </div>
        </Link>
        <Link href="/productions/events/new">
          <div className="rounded-lg border p-4 hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Plan an event</p>
                <p className="text-sm text-muted-foreground">
                  Set up your first production
                </p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* CTA */}
      <div className="pt-4">
        <Link href="/core/dashboard">
          <Button size="lg" className="min-w-[200px]">
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
