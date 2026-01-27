"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const onboardingSteps = [
  { path: "/onboarding", label: "Welcome" },
  { path: "/onboarding/profile", label: "Profile" },
  { path: "/onboarding/organization", label: "Organization" },
  { path: "/onboarding/team", label: "Team" },
  { path: "/onboarding/preferences", label: "Preferences" },
  { path: "/onboarding/integrations", label: "Integrations" },
  { path: "/onboarding/tour", label: "Tour" },
  { path: "/onboarding/complete", label: "Complete" },
];

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  const pathname = usePathname();
  const currentStepIndex = onboardingSteps.findIndex((step) => step.path === pathname);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">A</span>
            </div>
            <span className="text-xl font-bold">ATLVS</span>
          </Link>
          
          {/* Progress indicator */}
          <div className="hidden md:flex items-center gap-2">
            {onboardingSteps.map((step, index) => {
              const isComplete = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <React.Fragment key={step.path}>
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                      isComplete && "bg-primary text-primary-foreground",
                      isCurrent && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2",
                      !isComplete && !isCurrent && "bg-muted text-muted-foreground"
                    )}
                  >
                    {isComplete ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < onboardingSteps.length - 1 && (
                    <div
                      className={cn(
                        "h-0.5 w-8 transition-colors",
                        index < currentStepIndex ? "bg-primary" : "bg-muted"
                      )}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Mobile progress */}
          <div className="md:hidden text-sm text-muted-foreground">
            Step {currentStepIndex + 1} of {onboardingSteps.length}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-8 md:py-12">
        <div className="mx-auto max-w-2xl">
          {children}
        </div>
      </main>
    </div>
  );
}
