"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { UsersRound, ArrowRight, ArrowLeft, Loader2, Plus, X, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useOnboarding } from "../layout";
import { onboardingService } from "@/lib/services/onboarding.service";

interface InviteEntry {
  id: string;
  email: string;
  role: string;
}

const roles = [
  { value: "admin", label: "Administrator" },
  { value: "project_manager", label: "Project Manager" },
  { value: "finance_manager", label: "Finance Manager" },
  { value: "crew_member", label: "Crew Member" },
  { value: "member", label: "Team Member" },
];

export default function TeamInvitePage() {
  const router = useRouter();
  const { userId, organizationId, refreshProgress } = useOnboarding();

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [invites, setInvites] = React.useState<InviteEntry[]>([
    { id: "1", email: "", role: "member" },
  ]);

  React.useEffect(() => {
    async function initialize() {
      if (!userId) return;

      // Mark step as in progress
      await onboardingService.startStep(userId, "team_invite", organizationId || undefined);
      
      setIsLoading(false);
    }

    initialize();
  }, [userId, organizationId]);

  function addInvite() {
    setInvites([
      ...invites,
      { id: Date.now().toString(), email: "", role: "member" },
    ]);
  }

  function removeInvite(id: string) {
    if (invites.length > 1) {
      setInvites(invites.filter((invite) => invite.id !== id));
    }
  }

  function updateInvite(id: string, field: "email" | "role", value: string) {
    setInvites(
      invites.map((invite) =>
        invite.id === id ? { ...invite, [field]: value } : invite
      )
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!userId) return;

    setIsSubmitting(true);

    // Filter out empty invites
    const validInvites = invites.filter((invite) => invite.email.trim() !== "");

    // Complete onboarding step
    await onboardingService.completeStep(
      userId,
      "team_invite",
      { invites: validInvites },
      organizationId || undefined
    );

    await refreshProgress();

    // Navigate to next step
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
    await onboardingService.skipStep(userId, "team_invite", organizationId || undefined);
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

  const validInviteCount = invites.filter((i) => i.email.trim() !== "").length;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 mb-4">
          <UsersRound className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Invite Your Team</h1>
        <p className="text-lg text-muted-foreground">
          Add team members to collaborate with you on ATLVS. You can always invite more people later.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Invitations</CardTitle>
            <CardDescription>
              Enter email addresses and assign roles for your team members
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {invites.map((invite, index) => (
              <div key={invite.id} className="flex gap-3 items-start">
                <div className="flex-1 space-y-2">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        type="email"
                        placeholder="colleague@company.com"
                        value={invite.email}
                        onChange={(e) => updateInvite(invite.id, "email", e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    <Select
                      value={invite.role}
                      onValueChange={(value) => updateInvite(invite.id, "role", value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {invites.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeInvite(invite.id)}
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {index === 0 && (
                    <p className="text-xs text-muted-foreground">
                      They&apos;ll receive an email invitation to join your organization
                    </p>
                  )}
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addInvite}
              disabled={isSubmitting}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another
            </Button>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Invitation Tips</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Invitations expire after 7 days</li>
                  <li>• You can resend invitations from the Team settings</li>
                  <li>• Invited members will be guided through their own onboarding</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        {validInviteCount > 0 && (
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary">
              <Send className="h-3 w-3 mr-1" />
              {validInviteCount} invitation{validInviteCount !== 1 ? "s" : ""} ready to send
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
                  Sending...
                </>
              ) : validInviteCount > 0 ? (
                <>
                  Send Invitations
                  <ArrowRight className="ml-2 h-4 w-4" />
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
