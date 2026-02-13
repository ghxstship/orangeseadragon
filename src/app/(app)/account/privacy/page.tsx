"use client";

import * as React from "react";
import {
  Shield,
  Download,
  Trash2,
  Cookie,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  FileJson,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useConsentStore, type ConsentCategory } from "@/stores/consent-store";
import { useConfirmation } from "@/components/common/confirmation-dialog";
import { useToast } from "@/components/ui/use-toast";

// ============================================================================
// CONSENT CATEGORY METADATA
// ============================================================================

const CONSENT_CATEGORIES: {
  key: ConsentCategory;
  label: string;
  description: string;
  icon: React.ElementType;
  required: boolean;
}[] = [
  {
    key: "essential",
    label: "Essential Cookies",
    description: "Required for authentication, security, and core platform functionality. Cannot be disabled.",
    icon: Shield,
    required: true,
  },
  {
    key: "functional",
    label: "Functional Cookies",
    description: "Enable saved preferences, language settings, and personalized layouts.",
    icon: Cookie,
    required: false,
  },
  {
    key: "analytics",
    label: "Analytics",
    description: "Help us understand usage patterns to improve the platform experience.",
    icon: Eye,
    required: false,
  },
  {
    key: "marketing",
    label: "Marketing & Communications",
    description: "Used to deliver relevant product updates and feature announcements.",
    icon: Clock,
    required: false,
  },
];

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function PrivacySettingsPage() {
  const { consents, updateConsent, consentTimestamp, consentHistory, resetConsent } = useConsentStore();
  const { confirm, ConfirmDialog } = useConfirmation();
  const { toast } = useToast();
  const [exportLoading, setExportLoading] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  // ========================================================================
  // DATA EXPORT
  // ========================================================================

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const response = await fetch("/api/privacy/export");
      if (!response.ok) throw new Error("Export failed");

      const result = await response.json();
      const blob = new Blob([JSON.stringify(result.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `atlvs-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data exported",
        description: "Your personal data has been downloaded as JSON.",
      });
    } catch (_error) {
      toast({
        title: "Export failed",
        description: "Unable to export your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
    }
  };

  // ========================================================================
  // DATA DELETION REQUEST
  // ========================================================================

  const handleDeleteRequest = async () => {
    const ok = await confirm({
      title: "Request Data Deletion",
      description:
        "This will submit a request to permanently delete all your personal data. " +
        "You will have a 30-day cooling-off period to cancel. This action cannot be undone after that period.",
      confirmLabel: "Submit Deletion Request",
      variant: "destructive",
    });

    if (!ok) return;

    setDeleteLoading(true);
    try {
      const response = await fetch("/api/privacy/delete-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "User requested via privacy settings" }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Request failed",
          description: result.error?.message || "Unable to submit deletion request.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Deletion request submitted",
        description: "Your data will be deleted after the 30-day cooling-off period.",
      });
    } catch (_error) {
      toast({
        title: "Request failed",
        description: "Unable to submit deletion request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // ========================================================================
  // CONSENT RESET
  // ========================================================================

  const handleResetConsent = async () => {
    const ok = await confirm({
      title: "Reset Cookie Preferences",
      description: "This will reset all cookie preferences. The consent banner will appear again on your next page load.",
      confirmLabel: "Reset",
      variant: "destructive",
    });

    if (!ok) return;
    resetConsent();
    toast({
      title: "Preferences reset",
      description: "Cookie consent preferences have been cleared.",
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <ConfirmDialog />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Privacy & Data</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your privacy preferences, cookie consent, and personal data.
        </p>
      </div>

      {/* ================================================================ */}
      {/* COOKIE CONSENT MANAGEMENT */}
      {/* ================================================================ */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cookie className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Cookie Preferences</CardTitle>
          </div>
          <CardDescription>
            Control which types of cookies and tracking technologies are used.
            {consentTimestamp && (
              <span className="block mt-1 text-xs">
                Last updated: {new Date(consentTimestamp).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {CONSENT_CATEGORIES.map((cat) => (
            <div key={cat.key} className="flex items-start justify-between gap-4 py-2">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <cat.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <Label htmlFor={`privacy-consent-${cat.key}`} className="text-sm font-medium">
                    {cat.label}
                    {cat.required && (
                      <Badge variant="secondary" className="ml-2 text-[10px]">
                        Required
                      </Badge>
                    )}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>
                </div>
              </div>
              <Switch
                id={`privacy-consent-${cat.key}`}
                checked={cat.required || consents[cat.key]}
                onCheckedChange={(v) => updateConsent(cat.key, v)}
                disabled={cat.required}
                aria-label={`${cat.label} consent`}
                className="shrink-0"
              />
            </div>
          ))}

          <Separator />

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {consentHistory.length} consent change{consentHistory.length !== 1 ? "s" : ""} recorded
            </p>
            <Button variant="outline" size="sm" className="text-xs" onClick={handleResetConsent}>
              Reset Preferences
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* DATA PORTABILITY */}
      {/* ================================================================ */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Data Export</CardTitle>
          </div>
          <CardDescription>
            Download a copy of all your personal data in JSON format.
            This includes your profile, activity history, time entries, and notification preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Button onClick={handleExportData} disabled={exportLoading}>
              {exportLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileJson className="mr-2 h-4 w-4" />
              )}
              Export My Data
            </Button>
            <p className="text-xs text-muted-foreground">
              GDPR Article 20 — Right to Data Portability
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* DATA DELETION */}
      {/* ================================================================ */}
      <Card className="border-destructive/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            <CardTitle className="text-lg text-destructive">Data Deletion</CardTitle>
          </div>
          <CardDescription>
            Request permanent deletion of all your personal data. After submission,
            there is a mandatory 30-day cooling-off period during which you can cancel the request.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 mb-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">This action is irreversible after 30 days</p>
                <p>All your personal data, including profile information, activity history, time entries, and preferences will be permanently deleted.</p>
                <p>Organization data you created (projects, tasks, invoices) will be anonymized but not deleted, as it belongs to the organization.</p>
              </div>
            </div>
          </div>
          <Button variant="destructive" onClick={handleDeleteRequest} disabled={deleteLoading}>
            {deleteLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Request Data Deletion
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            GDPR Article 17 — Right to Erasure
          </p>
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* COMPLIANCE INFO */}
      {/* ================================================================ */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Compliance</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "GDPR", description: "General Data Protection Regulation (EU)" },
              { label: "CCPA", description: "California Consumer Privacy Act (US)" },
              { label: "LGPD", description: "Lei Geral de Proteção de Dados (Brazil)" },
              { label: "PIPEDA", description: "Personal Information Protection (Canada)" },
            ].map((reg) => (
              <div key={reg.label} className="flex items-center gap-3 rounded-lg border p-3">
                <Badge variant="outline" className="shrink-0">{reg.label}</Badge>
                <span className="text-xs text-muted-foreground">{reg.description}</span>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Data Protection Officer: dpo@atlvs.io</span>
            <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
