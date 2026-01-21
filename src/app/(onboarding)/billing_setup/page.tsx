"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CreditCard, ArrowRight, ArrowLeft, Loader2, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useOnboarding } from "../layout";
import { onboardingService } from "@/lib/services/onboarding.service";

interface Plan {
  id: string;
  name: string;
  tier: string;
  price: number;
  billingCycle: string;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: "core-monthly",
    name: "Core",
    tier: "core",
    price: 0,
    billingCycle: "month",
    features: [
      "Up to 5 team members",
      "3 active projects",
      "Basic reporting",
      "Email support",
    ],
  },
  {
    id: "pro-monthly",
    name: "Pro",
    tier: "pro",
    price: 49,
    billingCycle: "month",
    features: [
      "Up to 25 team members",
      "Unlimited projects",
      "Advanced reporting",
      "Priority support",
      "Integrations",
      "Custom fields",
    ],
    popular: true,
  },
  {
    id: "enterprise-monthly",
    name: "Enterprise",
    tier: "enterprise",
    price: 199,
    billingCycle: "month",
    features: [
      "Unlimited team members",
      "Unlimited projects",
      "Custom reporting",
      "Dedicated support",
      "SSO & SAML",
      "API access",
      "Custom integrations",
      "SLA guarantee",
    ],
  },
];

export default function BillingSetupPage() {
  const router = useRouter();
  const { userId, organizationId, refreshProgress } = useOnboarding();

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<string>("pro-monthly");

  React.useEffect(() => {
    async function initialize() {
      if (!userId) return;

      await onboardingService.startStep(userId, "billing_setup", organizationId || undefined);
      setIsLoading(false);
    }

    initialize();
  }, [userId, organizationId]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!userId) return;

    setIsSubmitting(true);

    await onboardingService.completeStep(
      userId,
      "billing_setup",
      { selectedPlan },
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
    await onboardingService.skipStep(userId, "billing_setup", organizationId || undefined);
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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 mb-4">
          <CreditCard className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Choose Your Plan</h1>
        <p className="text-lg text-muted-foreground">
          Start with a 14-day free trial of Pro features. No credit card required.
        </p>
      </div>

      {/* Trial Banner */}
      <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-center">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Sparkles className="h-5 w-5" />
          <span className="font-medium">14-day free trial on all paid plans</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Try all Pro features free. Downgrade anytime.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Plans */}
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                "relative cursor-pointer transition-all hover:shadow-md",
                selectedPlan === plan.id && "ring-2 ring-primary shadow-md",
                plan.popular && "border-primary"
              )}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.name}
                  {selectedPlan === plan.id && (
                    <div className="rounded-full bg-primary p-1">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">
                    ${plan.price}
                  </span>
                  <span className="text-muted-foreground">/{plan.billingCycle}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Info Note */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              You won&apos;t be charged during your trial. We&apos;ll remind you before it ends.
              You can add payment details later in Settings → Billing.
            </p>
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
              Decide later
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting trial...
                </>
              ) : (
                <>
                  Start Free Trial
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
