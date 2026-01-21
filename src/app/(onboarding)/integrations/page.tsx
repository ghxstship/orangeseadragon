"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plug, ArrowRight, ArrowLeft, Loader2, Check, ExternalLink } from "lucide-react";
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

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  connected: boolean;
  popular?: boolean;
}

const integrations: Integration[] = [
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Sync events and schedules",
    icon: "📅",
    category: "Calendar",
    connected: false,
    popular: true,
  },
  {
    id: "outlook",
    name: "Microsoft Outlook",
    description: "Sync calendar and contacts",
    icon: "📧",
    category: "Calendar",
    connected: false,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Get notifications in Slack",
    icon: "💬",
    category: "Communication",
    connected: false,
    popular: true,
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    description: "Sync invoices and expenses",
    icon: "💰",
    category: "Accounting",
    connected: false,
  },
  {
    id: "xero",
    name: "Xero",
    description: "Sync financial data",
    icon: "📊",
    category: "Accounting",
    connected: false,
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Process payments",
    icon: "💳",
    category: "Payments",
    connected: false,
    popular: true,
  },
  {
    id: "dropbox",
    name: "Dropbox",
    description: "Store and share files",
    icon: "📁",
    category: "Storage",
    connected: false,
  },
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Store and share files",
    icon: "📂",
    category: "Storage",
    connected: false,
  },
];

export default function IntegrationsPage() {
  const router = useRouter();
  const { userId, organizationId, refreshProgress } = useOnboarding();

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [connectedIntegrations, setConnectedIntegrations] = React.useState<string[]>([]);

  React.useEffect(() => {
    async function initialize() {
      if (!userId) return;

      await onboardingService.startStep(userId, "integrations", organizationId || undefined);
      setIsLoading(false);
    }

    initialize();
  }, [userId, organizationId]);

  function toggleIntegration(id: string) {
    setConnectedIntegrations((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!userId) return;

    setIsSubmitting(true);

    await onboardingService.completeStep(
      userId,
      "integrations",
      { connectedIntegrations },
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
    await onboardingService.skipStep(userId, "integrations", organizationId || undefined);
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

  const categories = Array.from(new Set(integrations.map((i) => i.category)));

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 mb-4">
          <Plug className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Connect Your Tools</h1>
        <p className="text-lg text-muted-foreground">
          Integrate ATLVS with your favorite tools to streamline your workflow.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Popular Integrations */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Integrations</CardTitle>
            <CardDescription>
              Most teams connect these first
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {integrations
                .filter((i) => i.popular)
                .map((integration) => {
                  const isConnected = connectedIntegrations.includes(integration.id);
                  return (
                    <div
                      key={integration.id}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-sm",
                        isConnected && "border-primary bg-primary/5"
                      )}
                      onClick={() => toggleIntegration(integration.id)}
                    >
                      <span className="text-2xl">{integration.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{integration.name}</span>
                          {isConnected && (
                            <Badge variant="secondary" className="text-xs">
                              <Check className="h-3 w-3 mr-1" />
                              Selected
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {integration.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* All Integrations by Category */}
        {categories.map((category) => {
          const categoryIntegrations = integrations.filter(
            (i) => i.category === category && !i.popular
          );
          if (categoryIntegrations.length === 0) return null;

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {categoryIntegrations.map((integration) => {
                    const isConnected = connectedIntegrations.includes(integration.id);
                    return (
                      <div
                        key={integration.id}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-sm",
                          isConnected && "border-primary bg-primary/5"
                        )}
                        onClick={() => toggleIntegration(integration.id)}
                      >
                        <span className="text-2xl">{integration.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{integration.name}</span>
                            {isConnected && (
                              <Badge variant="secondary" className="text-xs">
                                <Check className="h-3 w-3 mr-1" />
                                Selected
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {integration.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Note */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <ExternalLink className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">
                  You&apos;ll be able to configure each integration after completing onboarding.
                  More integrations are available in Settings → Integrations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        {connectedIntegrations.length > 0 && (
          <div className="flex items-center justify-center">
            <Badge variant="secondary">
              {connectedIntegrations.length} integration{connectedIntegrations.length !== 1 ? "s" : ""} selected
            </Badge>
          </div>
        )}

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
