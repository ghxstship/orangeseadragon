"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Zap, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Zap,
    title: "Streamlined Workflows",
    description: "Automate repetitive tasks and focus on what matters",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Work together seamlessly across departments",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Your data is protected with industry-leading security",
  },
];

export default function OnboardingWelcomePage() {
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
          Let&apos;s get you set up in just a few minutes. We&apos;ll help you configure 
          your workspace for maximum productivity.
        </p>
      </div>

      {/* Features */}
      <div className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-lg border bg-card p-4 text-center"
          >
            <feature.icon className="mx-auto h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold">{feature.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-4">
        <Link href="/onboarding/profile">
          <Button size="lg" className="min-w-[200px]">
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <p className="text-sm text-muted-foreground">
          Takes about 5 minutes to complete
        </p>
      </div>
    </div>
  );
}
