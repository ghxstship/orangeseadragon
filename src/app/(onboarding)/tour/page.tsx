"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, ChevronLeft, ChevronRight, LayoutDashboard, FolderKanban, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tourSteps = [
  {
    title: "Your Dashboard",
    description: "Your personal command center. See tasks, upcoming events, and key metrics at a glance.",
    icon: LayoutDashboard,
    image: "/tour/dashboard.png",
  },
  {
    title: "Project Management",
    description: "Organize work into projects with tasks, timelines, and team collaboration.",
    icon: FolderKanban,
    image: "/tour/projects.png",
  },
  {
    title: "Team Collaboration",
    description: "Assign tasks, share files, and communicate with your team in real-time.",
    icon: Users,
    image: "/tour/team.png",
  },
  {
    title: "Calendar & Scheduling",
    description: "View all your events, deadlines, and meetings in one unified calendar.",
    icon: Calendar,
    image: "/tour/calendar.png",
  },
];

export default function OnboardingTourPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(0);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push("/onboarding/complete");
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = tourSteps[currentStep];
  const Icon = step.icon;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Quick tour</h1>
        <p className="text-muted-foreground">
          Let us show you around. This will only take a minute.
        </p>
      </div>

      {/* Tour content */}
      <div className="rounded-lg border overflow-hidden">
        {/* Image placeholder */}
        <div className="aspect-video bg-muted flex items-center justify-center">
          <Icon className="h-24 w-24 text-muted-foreground/50" />
        </div>
        
        {/* Content */}
        <div className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">{step.title}</h2>
          <p className="text-muted-foreground">{step.description}</p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex justify-center gap-2">
        {tourSteps.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentStep(index)}
            className={cn(
              "h-2 w-2 rounded-full transition-colors",
              index === currentStep ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <div className="flex gap-2">
          <Link href="/onboarding/integrations">
            <Button type="button" variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          {currentStep > 0 && (
            <Button type="button" variant="outline" onClick={handlePrev}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Link href="/onboarding/complete">
            <Button type="button" variant="ghost">
              Skip tour
            </Button>
          </Link>
          <Button onClick={handleNext}>
            {currentStep < tourSteps.length - 1 ? (
              <>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </>
            ) : (
              <>
                Finish
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
