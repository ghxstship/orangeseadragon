"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Loader2, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const integrations = [
  {
    id: "google",
    name: "Google Workspace",
    description: "Sync calendars, drive, and contacts",
    icon: "🔵",
    popular: true,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Get notifications and updates in Slack",
    icon: "💬",
    popular: true,
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    description: "Sync invoices and expenses",
    icon: "💰",
    popular: false,
  },
  {
    id: "dropbox",
    name: "Dropbox",
    description: "Access and share files from Dropbox",
    icon: "📦",
    popular: false,
  },
  {
    id: "zoom",
    name: "Zoom",
    description: "Schedule and join meetings",
    icon: "📹",
    popular: true,
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Process payments and invoices",
    icon: "💳",
    popular: false,
  },
];

export default function OnboardingIntegrationsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [connected, setConnected] = React.useState<string[]>([]);
  const [connecting, setConnecting] = React.useState<string | null>(null);

  const handleConnect = async (id: string) => {
    setConnecting(id);
    
    // TODO: Implement actual OAuth flow
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setConnected([...connected, id]);
    setConnecting(null);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    // TODO: Save integration preferences
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    router.push("/onboarding/tour");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Connect your tools</h1>
        <p className="text-muted-foreground">
          Integrate with the apps you already use. You can add more later.
        </p>
      </div>

      {/* Integrations grid */}
      <div className="grid gap-3 md:grid-cols-2">
        {integrations.map((integration) => {
          const isConnected = connected.includes(integration.id);
          const isConnecting = connecting === integration.id;
          
          return (
            <div
              key={integration.id}
              className={cn(
                "flex items-center justify-between rounded-lg border p-4 transition-colors",
                isConnected && "border-green-500/50 bg-green-500/5"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-xl">
                  {integration.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{integration.name}</p>
                    {integration.popular && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {integration.description}
                  </p>
                </div>
              </div>
              <Button
                variant={isConnected ? "outline" : "secondary"}
                size="sm"
                onClick={() => !isConnected && handleConnect(integration.id)}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isConnected ? (
                  <>
                    <Check className="mr-1 h-4 w-4 text-green-500" />
                    Connected
                  </>
                ) : (
                  "Connect"
                )}
              </Button>
            </div>
          );
        })}
      </div>

      {/* More integrations link */}
      <div className="text-center">
        <a
          href="/account/integrations"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          View all integrations
          <ExternalLink className="ml-1 h-3 w-3" />
        </a>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Link href="/onboarding/preferences">
          <Button type="button" variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link href="/onboarding/tour">
            <Button type="button" variant="ghost">
              Skip for now
            </Button>
          </Link>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
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
    </div>
  );
}
