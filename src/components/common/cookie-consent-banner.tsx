"use client";

import * as React from "react";
import { Shield, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  useConsentStore,
  type ConsentCategory,
} from "@/stores/consent-store";

// ============================================================================
// CONSENT CATEGORY METADATA
// ============================================================================

interface ConsentCategoryInfo {
  key: ConsentCategory;
  label: string;
  description: string;
  required: boolean;
}

const CONSENT_CATEGORIES: ConsentCategoryInfo[] = [
  {
    key: "essential",
    label: "Essential",
    description:
      "Required for the platform to function. Includes authentication, security, and session management.",
    required: true,
  },
  {
    key: "functional",
    label: "Functional",
    description:
      "Enables enhanced features like saved preferences, language settings, and personalized layouts.",
    required: false,
  },
  {
    key: "analytics",
    label: "Analytics",
    description:
      "Helps us understand how you use the platform so we can improve the experience.",
    required: false,
  },
  {
    key: "marketing",
    label: "Marketing",
    description:
      "Used to deliver relevant product updates and feature announcements.",
    required: false,
  },
];

// ============================================================================
// COOKIE CONSENT BANNER
// ============================================================================

export function CookieConsentBanner() {
  const { hasConsented, acceptAll, rejectNonEssential, savePreferences, consents } =
    useConsentStore();
  const [showDetails, setShowDetails] = React.useState(false);
  const [localPrefs, setLocalPrefs] = React.useState<
    Record<ConsentCategory, boolean>
  >({ ...consents });
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render during SSR or if user already consented
  if (!mounted || hasConsented) return null;

  const handleSavePreferences = () => {
    savePreferences(localPrefs);
  };

  const handleToggle = (category: ConsentCategory, value: boolean) => {
    if (category === "essential") return;
    setLocalPrefs((prev) => ({ ...prev, [category]: value }));
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-modal="false"
      className={cn(
        "fixed bottom-0 inset-x-0 z-[100] p-4 md:p-6",
        "animate-in slide-in-from-bottom-4 duration-300"
      )}
    >
      <div className="mx-auto max-w-2xl rounded-2xl border bg-background/95 backdrop-blur-xl shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold">Privacy Preferences</h2>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                We use cookies and similar technologies to provide essential
                functionality and improve your experience. You can customize your
                preferences below.
              </p>
            </div>
          </div>

          {/* Detail panel */}
          {showDetails && (
            <div className="mb-4 space-y-3 rounded-xl border bg-muted/30 p-4">
              {CONSENT_CATEGORIES.map((cat) => (
                <div
                  key={cat.key}
                  className="flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <Label
                      htmlFor={`consent-${cat.key}`}
                      className="text-xs font-medium"
                    >
                      {cat.label}
                      {cat.required && (
                        <span className="ml-1.5 text-[10px] text-muted-foreground">
                          (Required)
                        </span>
                      )}
                    </Label>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                  <Switch
                    id={`consent-${cat.key}`}
                    checked={cat.required || localPrefs[cat.key]}
                    onCheckedChange={(v) => handleToggle(cat.key, v)}
                    disabled={cat.required}
                    aria-label={`${cat.label} cookies`}
                    className="shrink-0 mt-0.5"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Settings2 className="mr-1.5 h-3.5 w-3.5" />
              {showDetails ? "Hide Details" : "Customize"}
            </Button>
            <div className="flex-1" />
            {showDetails ? (
              <Button size="sm" className="text-xs" onClick={handleSavePreferences}>
                Save Preferences
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={rejectNonEssential}
                >
                  Essential Only
                </Button>
                <Button size="sm" className="text-xs" onClick={acceptAll}>
                  Accept All
                </Button>
              </>
            )}
          </div>

          {/* Privacy policy link */}
          <p className="mt-3 text-[10px] text-muted-foreground text-center">
            By continuing, you agree to our{" "}
            <a href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </a>{" "}
            and{" "}
            <a href="/terms" className="underline hover:text-foreground">
              Terms of Service
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
