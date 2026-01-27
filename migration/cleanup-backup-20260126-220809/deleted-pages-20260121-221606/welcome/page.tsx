"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  ArrowRight, 
  Crown, 
  Shield, 
  FolderKanban, 
  Wallet, 
  HardHat, 
  Music, 
  Store, 
  Briefcase, 
  HeartHandshake,
  User,
  Loader2,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useOnboarding } from "../layout";
import { onboardingService, AccountTypeConfig } from "@/lib/services/onboarding.service";

const iconMap: Record<string, React.ElementType> = {
  crown: Crown,
  shield: Shield,
  "folder-kanban": FolderKanban,
  wallet: Wallet,
  "hard-hat": HardHat,
  music: Music,
  store: Store,
  briefcase: Briefcase,
  "heart-handshake": HeartHandshake,
  user: User,
};

export default function WelcomePage() {
  const router = useRouter();
  const { userId, accountType, organizationId, refreshProgress } = useOnboarding();
  
  const [accountTypes, setAccountTypes] = React.useState<AccountTypeConfig[]>([]);
  const [selectedType, setSelectedType] = React.useState<string | null>(accountType);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    async function loadAccountTypes() {
      const types = await onboardingService.getAccountTypes();
      setAccountTypes(types);
      setIsLoading(false);
    }
    loadAccountTypes();
  }, []);

  async function handleContinue() {
    if (!selectedType || !userId) return;

    setIsSubmitting(true);

    // Initialize onboarding with selected account type
    await onboardingService.initializeOnboarding(
      userId,
      selectedType,
      organizationId || undefined
    );

    // Start the first step
    await onboardingService.startStep(userId, "welcome", organizationId || undefined);
    
    // Complete the welcome step
    await onboardingService.completeStep(
      userId,
      "welcome",
      { selectedAccountType: selectedType },
      organizationId || undefined
    );

    await refreshProgress();

    // Get next step and navigate
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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to ATLVS!</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Let&apos;s get you set up. First, tell us about your role so we can personalize your experience.
        </p>
      </div>

      {/* Account Type Selection */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-center">What best describes your role?</h2>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accountTypes.map((type) => {
            const Icon = iconMap[type.icon || "user"] || User;
            const isSelected = selectedType === type.slug;
            
            return (
              <Card
                key={type.slug}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  isSelected && "ring-2 ring-primary shadow-md"
                )}
                onClick={() => setSelectedType(type.slug)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div
                      className="rounded-lg p-2"
                      style={{ backgroundColor: `${type.color}20` }}
                    >
                      <Icon
                        className="h-5 w-5"
                        style={{ color: type.color }}
                      />
                    </div>
                    {isSelected && (
                      <div className="rounded-full bg-primary p-1">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-base">{type.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {type.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-center pt-4">
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!selectedType || isSubmitting}
          className="min-w-[200px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting up...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Help text */}
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t worry, you can change this later in your settings.
      </p>
    </div>
  );
}
