"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Loader2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function OnboardingProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    jobTitle: "",
    bio: "",
    avatarUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          job_title: formData.jobTitle,
          bio: formData.bio,
          avatar_url: formData.avatarUrl,
        },
      });

      await supabase
        .from('users')
        .update({
          full_name: fullName,
          avatar_url: formData.avatarUrl || null,
        })
        .eq('id', user.id);

      router.push("/onboarding/organization");
    } catch (err) {
      console.error('[Onboarding] Profile save failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const initials = `${formData.firstName?.[0] || ""}${formData.lastName?.[0] || ""}`.toUpperCase() || "?";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Set up your profile</h1>
        <p className="text-muted-foreground">
          Tell us a bit about yourself
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <div className="flex justify-center">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={formData.avatarUrl} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <button
              type="button"
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Name fields */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              placeholder="John"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Job title */}
        <div className="space-y-2">
          <Label htmlFor="jobTitle">Job title</Label>
          <Input
            id="jobTitle"
            placeholder="Production Manager"
            value={formData.jobTitle}
            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            disabled={isLoading}
          />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Short bio (optional)</Label>
          <Textarea
            id="bio"
            placeholder="Tell your team a bit about yourself..."
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={3}
            disabled={isLoading}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Link href="/onboarding">
            <Button type="button" variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
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
      </form>
    </div>
  );
}
