"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles, ArrowRight, Loader2, Crown, Shield, FolderKanban,
  Wallet, HardHat, Music, Store, Briefcase, HeartHandshake, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { captureError } from "@/lib/observability";

interface AccountType {
  slug: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  crown: Crown,
  shield: Shield,
  'folder-kanban': FolderKanban,
  wallet: Wallet,
  'hard-hat': HardHat,
  music: Music,
  store: Store,
  briefcase: Briefcase,
  'heart-handshake': HeartHandshake,
  user: User,
};

export default function OnboardingWelcomePage() {
  const router = useRouter();
  const [accountTypes, setAccountTypes] = React.useState<AccountType[]>([]);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/onboarding/account-types");
        if (!res.ok || cancelled) {
          if (!cancelled) setIsLoading(false);
          return;
        }
        const json = await res.json();
        const types = (json.data ?? json) as Array<{
          slug: string;
          name: string;
          description?: string;
          icon?: string;
          color?: string;
        }>;

        if (!cancelled) {
          setAccountTypes(
            types.map((t) => ({
              slug: t.slug,
              name: t.name,
              description: t.description || "",
              icon: ICON_MAP[t.icon || "user"] || User,
              color: t.color || "hsl(var(--muted-foreground))",
            }))
          );
        }
      } catch (err) {
        captureError(err, "onboarding.welcome.fetchTypes");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleContinue = async () => {
    if (!selected) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/onboarding/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountType: selected }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        captureError(err, "onboarding.welcome.initialize");
      }
      router.push("/onboarding/profile");
    } catch (err) {
      captureError(err, "onboarding.welcome.initialize");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to ATLVS
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Let&apos;s get you set up in just a few minutes. First, tell us how
          you&apos;ll be using ATLVS so we can personalize your experience.
        </p>
      </div>

      {/* Account type selection */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : accountTypes.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {accountTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selected === type.slug;
            return (
              <Button
                key={type.slug}
                type="button"
                variant="outline"
                onClick={() => setSelected(type.slug)}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-4 text-left transition-all h-auto justify-start",
                  "hover:border-primary/50 hover:bg-muted/50",
                  isSelected && "border-primary bg-primary/5 ring-1 ring-primary"
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium">{type.name}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {type.description}
                  </p>
                </div>
              </Button>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">
          No account types available. Please contact support.
        </p>
      )}

      {/* CTA */}
      <div className="flex flex-col items-center gap-4">
        <Button
          size="lg"
          className="min-w-[200px]"
          disabled={!selected || isSubmitting}
          onClick={handleContinue}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting up...
            </>
          ) : (
            <>
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
        <p className="text-sm text-muted-foreground">
          Takes about 5 minutes to complete
        </p>
      </div>
    </div>
  );
}
