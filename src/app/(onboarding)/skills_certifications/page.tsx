"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Award, ArrowRight, ArrowLeft, Loader2, Plus, X, Search } from "lucide-react";
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

interface Skill {
  id: string;
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  expiresAt?: string;
}

const suggestedSkills = [
  "Audio Engineering",
  "Lighting Design",
  "Stage Management",
  "Video Production",
  "Rigging",
  "Carpentry",
  "Electrical",
  "Event Coordination",
  "Project Management",
  "Forklift Operation",
  "First Aid",
  "Crowd Management",
];

const skillLevels = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
];

export default function SkillsCertificationsPage() {
  const router = useRouter();
  const { userId, organizationId, refreshProgress } = useOnboarding();

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [skills, setSkills] = React.useState<Skill[]>([]);
  const [certifications, setCertifications] = React.useState<Certification[]>([]);
  const [skillSearch, setSkillSearch] = React.useState("");

  React.useEffect(() => {
    async function initialize() {
      if (!userId) return;

      await onboardingService.startStep(userId, "skills_certifications", organizationId || undefined);
      setIsLoading(false);
    }

    initialize();
  }, [userId, organizationId]);

  function addSkill(name: string) {
    if (skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) return;
    
    setSkills([
      ...skills,
      { id: Date.now().toString(), name, level: "intermediate" },
    ]);
    setSkillSearch("");
  }

  function removeSkill(id: string) {
    setSkills(skills.filter((s) => s.id !== id));
  }

  function updateSkillLevel(id: string, level: Skill["level"]) {
    setSkills(skills.map((s) => (s.id === id ? { ...s, level } : s)));
  }

  function addCertification() {
    setCertifications([
      ...certifications,
      { id: Date.now().toString(), name: "", issuer: "" },
    ]);
  }

  function removeCertification(id: string) {
    setCertifications(certifications.filter((c) => c.id !== id));
  }

  function updateCertification(id: string, field: keyof Certification, value: string) {
    setCertifications(
      certifications.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!userId) return;

    setIsSubmitting(true);

    await onboardingService.completeStep(
      userId,
      "skills_certifications",
      { skills, certifications },
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

  const filteredSuggestions = suggestedSkills.filter(
    (s) =>
      s.toLowerCase().includes(skillSearch.toLowerCase()) &&
      !skills.some((skill) => skill.name.toLowerCase() === s.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 mb-4">
          <Award className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Skills & Certifications</h1>
        <p className="text-lg text-muted-foreground">
          Help us match you with the right assignments by adding your skills and certifications.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
            <CardDescription>
              Add your professional skills and rate your proficiency level
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Skill Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search or add a skill..."
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && skillSearch.trim()) {
                    e.preventDefault();
                    addSkill(skillSearch.trim());
                  }
                }}
                className="pl-10"
                disabled={isSubmitting}
              />
            </div>

            {/* Suggestions */}
            {skillSearch && filteredSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filteredSuggestions.slice(0, 6).map((suggestion) => (
                  <Badge
                    key={suggestion}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => addSkill(suggestion)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {suggestion}
                  </Badge>
                ))}
              </div>
            )}

            {/* Added Skills */}
            {skills.length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                {skills.map((skill) => (
                  <div key={skill.id} className="flex items-center gap-3">
                    <span className="flex-1 font-medium">{skill.name}</span>
                    <Select
                      value={skill.level}
                      onValueChange={(value) =>
                        updateSkillLevel(skill.id, value as Skill["level"])
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {skillLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSkill(skill.id)}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {skills.length === 0 && !skillSearch && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Quick add popular skills:
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestedSkills.slice(0, 6).map((suggestion) => (
                    <Badge
                      key={suggestion}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => addSkill(suggestion)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card>
          <CardHeader>
            <CardTitle>Certifications</CardTitle>
            <CardDescription>
              Add any professional certifications you hold
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {certifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No certifications added yet
              </p>
            ) : (
              certifications.map((cert) => (
                <div key={cert.id} className="flex gap-3 items-start p-3 rounded-lg border">
                  <div className="flex-1 grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Certification Name</label>
                      <Input
                        value={cert.name}
                        onChange={(e) =>
                          updateCertification(cert.id, "name", e.target.value)
                        }
                        placeholder="e.g., OSHA 30"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Issuing Organization</label>
                      <Input
                        value={cert.issuer}
                        onChange={(e) =>
                          updateCertification(cert.id, "issuer", e.target.value)
                        }
                        placeholder="e.g., OSHA"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Expiration (optional)</label>
                      <input
                        type="date"
                        value={cert.expiresAt || ""}
                        onChange={(e) =>
                          updateCertification(cert.id, "expiresAt", e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCertification(cert.id)}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCertification}
              disabled={isSubmitting}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Certification
            </Button>
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
      </form>
    </div>
  );
}
