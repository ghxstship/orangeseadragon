"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, ArrowRight, ArrowLeft, Loader2, Plus, X, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { captureError } from '@/lib/observability';

const roles = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "member", label: "Team Member" },
  { value: "viewer", label: "Viewer" },
];

interface Invite {
  id: string;
  email: string;
  role: string;
}

export default function OnboardingTeamPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [invites, setInvites] = React.useState<Invite[]>([]);
  const [newEmail, setNewEmail] = React.useState("");
  const [newRole, setNewRole] = React.useState("member");

  const addInvite = () => {
    if (!newEmail || !newEmail.includes("@")) return;
    
    setInvites([
      ...invites,
      { id: crypto.randomUUID(), email: newEmail, role: newRole },
    ]);
    setNewEmail("");
    setNewRole("member");
  };

  const removeInvite = (id: string) => {
    setInvites(invites.filter((invite) => invite.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (invites.length > 0) {
        const response = await fetch('/api/invitations/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invites: invites.map(({ email, role }) => ({ email, role })) }),
        });
        if (!response.ok) {
          const err = await response.json().catch(() => null);
          captureError(err, 'onboarding.team.inviteSend');
        }
      }
      router.push("/onboarding/preferences");
    } catch (err) {
      captureError(err, 'onboarding.team.invite');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Invite your team</h1>
        <p className="text-muted-foreground">
          Collaboration is better together. Invite your colleagues to join.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Add invite */}
        <div className="space-y-2">
          <Label>Add team members</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="colleague@company.com"
                className="pl-10"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addInvite();
                  }
                }}
              />
            </div>
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" variant="outline" onClick={addInvite}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Invite list */}
        {invites.length > 0 && (
          <div className="space-y-2">
            <Label>Pending invitations ({invites.length})</Label>
            <div className="rounded-lg border divide-y">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{invite.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {roles.find((r) => r.value === invite.role)?.label}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeInvite(invite.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {invites.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Users className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              No invitations yet. Add team members above.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Link href="/onboarding/organization">
            <Button type="button" variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="flex gap-2">
            <Link href="/onboarding/preferences">
              <Button type="button" variant="ghost">
                Skip for now
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  {invites.length > 0 ? "Send invites" : "Continue"}
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
