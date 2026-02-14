"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const industries = [
  "Live Events & Entertainment",
  "Film & Television",
  "Music & Recording",
  "Corporate Events",
  "Sports & Athletics",
  "Theater & Performing Arts",
  "Festivals & Conferences",
  "Other",
];

const companySizes = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "500+ employees",
];

export default function OnboardingOrganizationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    website: "",
    industry: "",
    size: "",
    logoUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const orgId = user.user_metadata?.organization_id;
      if (orgId) {
        await supabase
          .from('organizations')
          .update({
            name: formData.name,
            website: formData.website || null,
            industry: formData.industry || null,
            company_size: formData.size || null,
            logo_url: formData.logoUrl || null,
          })
          .eq('id', orgId);
      } else {
        const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: formData.name,
            slug,
            website: formData.website || null,
            industry: formData.industry || null,
            company_size: formData.size || null,
            logo_url: formData.logoUrl || null,
          })
          .select('id')
          .single();

        if (orgError) throw orgError;

        await supabase.from('organization_members').insert({
          organization_id: org.id,
          user_id: user.id,
          role_id: null as unknown as string,
          is_owner: true,
          status: 'active',
        });

        await supabase.auth.updateUser({
          data: { organization_id: org.id },
        });
      }

      router.push("/onboarding/team");
    } catch (err) {
      console.error('[Onboarding] Organization save failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Set up your organization</h1>
        <p className="text-muted-foreground">
          Tell us about your company or team
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo upload */}
        <div className="flex justify-center">
          <button
            type="button"
            className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors"
          >
            {formData.logoUrl ? (
              <Image src={formData.logoUrl} alt="Logo" className="h-full w-full object-contain rounded-lg" fill unoptimized />
            ) : (
              <div className="text-center">
                <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground mt-1">Logo</span>
              </div>
            )}
          </button>
        </div>

        {/* Organization name */}
        <div className="space-y-2">
          <Label htmlFor="name">Organization name</Label>
          <Input
            id="name"
            placeholder="Acme Productions"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>

        {/* Website */}
        <div className="space-y-2">
          <Label htmlFor="website">Website (optional)</Label>
          <Input
            id="website"
            type="url"
            placeholder="https://example.com"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            disabled={isLoading}
          />
        </div>

        {/* Industry */}
        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Select
            value={formData.industry}
            onValueChange={(value) => setFormData({ ...formData, industry: value })}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Company size */}
        <div className="space-y-2">
          <Label htmlFor="size">Company size</Label>
          <Select
            value={formData.size}
            onValueChange={(value) => setFormData({ ...formData, size: value })}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              {companySizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Link href="/onboarding/profile">
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
