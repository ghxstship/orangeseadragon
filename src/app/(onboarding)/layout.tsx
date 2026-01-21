"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Compass, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { authService } from "@/lib/services/auth.service";
import { onboardingService } from "@/lib/services/onboarding.service";

interface OnboardingContextValue {
  userId: string | null;
  accountType: string | null;
  organizationId: string | null;
  currentStep: string | null;
  totalSteps: number;
  completedSteps: number;
  percentComplete: number;
  isLoading: boolean;
  refreshProgress: () => Promise<void>;
}

const OnboardingContext = React.createContext<OnboardingContextValue | null>(null);

export function useOnboarding() {
  const context = React.useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingLayout");
  }
  return context;
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [accountType, setAccountType] = React.useState<string | null>(null);
  const [organizationId, setOrganizationId] = React.useState<string | null>(null);
  const [currentStep, setCurrentStep] = React.useState<string | null>(null);
  const [totalSteps, setTotalSteps] = React.useState(0);
  const [completedSteps, setCompletedSteps] = React.useState(0);
  const [percentComplete, setPercentComplete] = React.useState(0);

  const refreshProgress = React.useCallback(async () => {
    if (!userId) return;

    const summary = await onboardingService.getOnboardingSummary(userId, organizationId || undefined);
    if (summary) {
      setCurrentStep(summary.currentStep || null);
      setTotalSteps(summary.totalSteps);
      setCompletedSteps(summary.completedSteps);
      setPercentComplete(summary.percentComplete);
    }
  }, [userId, organizationId]);

  React.useEffect(() => {
    async function initializeOnboarding() {
      try {
        const user = await authService.getCurrentUser();
        
        if (!user) {
          router.push("/login");
          return;
        }

        // Check if onboarding is already complete
        if (user.onboardingCompletedAt) {
          router.push("/dashboard");
          return;
        }

        setUserId(user.id);
        setAccountType(user.accountType);

        // Get user's membership to find organization
        const userWithMembership = await authService.getUserWithMembership(user.id);
        if (userWithMembership?.organizationId) {
          setOrganizationId(userWithMembership.organizationId);
        }

        // Check if onboarding state exists, if not initialize it
        const state = await onboardingService.getOnboardingState(
          user.id,
          userWithMembership?.organizationId
        );

        if (!state) {
          await onboardingService.initializeOnboarding(
            user.id,
            user.accountType,
            userWithMembership?.organizationId
          );
        }

        // Get progress summary
        const summary = await onboardingService.getOnboardingSummary(
          user.id,
          userWithMembership?.organizationId
        );

        if (summary) {
          setCurrentStep(summary.currentStep || null);
          setTotalSteps(summary.totalSteps);
          setCompletedSteps(summary.completedSteps);
          setPercentComplete(summary.percentComplete);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize onboarding:", error);
        setIsLoading(false);
      }
    }

    initializeOnboarding();
  }, [router]);

  async function handleLogout() {
    await authService.logout();
    router.push("/login");
  }

  const contextValue: OnboardingContextValue = {
    userId,
    accountType,
    organizationId,
    currentStep,
    totalSteps,
    completedSteps,
    percentComplete,
    isLoading,
    refreshProgress,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <Compass className="h-12 w-12 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <OnboardingContext.Provider value={contextValue}>
      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <header className="border-b bg-background">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">ATLVS</span>
              </div>
              
              <div className="flex items-center gap-4">
                {totalSteps > 0 && (
                  <div className="hidden sm:flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {completedSteps} of {totalSteps} steps complete
                    </span>
                    <Progress value={percentComplete} className="w-32 h-2" />
                  </div>
                )}
                
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile progress */}
        {totalSteps > 0 && (
          <div className="sm:hidden border-b bg-background px-4 py-2">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {completedSteps}/{totalSteps}
              </span>
              <Progress value={percentComplete} className="flex-1 h-2" />
              <span className="text-sm font-medium">{percentComplete}%</span>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </OnboardingContext.Provider>
  );
}
