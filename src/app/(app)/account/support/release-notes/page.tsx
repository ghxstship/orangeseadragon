"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Rocket,
  Bug,
  Sparkles,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface ReleaseNote {
  id: string;
  version: string;
  date: string;
  type: "major" | "minor" | "patch";
  highlights: string[];
  features: string[];
  fixes: string[];
  breaking?: string[];
}

const releaseNotes: ReleaseNote[] = [
  {
    id: "1",
    version: "v2.4.1",
    date: "2024-06-15",
    type: "patch",
    highlights: ["Performance improvements", "Bug fixes"],
    features: [],
    fixes: [
      "Fixed issue with event calendar not loading properly",
      "Resolved notification delay in real-time updates",
      "Fixed pagination in member directory",
    ],
  },
  {
    id: "2",
    version: "v2.4.0",
    date: "2024-06-10",
    type: "minor",
    highlights: ["New dashboard widgets", "Improved reporting"],
    features: [
      "Added customizable dashboard widgets",
      "New advanced reporting module",
      "Bulk import/export functionality",
      "Enhanced search with filters",
    ],
    fixes: [
      "Fixed timezone issues in scheduling",
      "Resolved memory leak in real-time sync",
    ],
  },
  {
    id: "3",
    version: "v2.3.0",
    date: "2024-05-20",
    type: "minor",
    highlights: ["Mobile app improvements", "New integrations"],
    features: [
      "Stripe payment integration",
      "Google Calendar sync",
      "Mobile push notifications",
      "Dark mode support",
    ],
    fixes: [
      "Fixed login issues on Safari",
      "Resolved file upload size limits",
    ],
  },
  {
    id: "4",
    version: "v2.0.0",
    date: "2024-04-01",
    type: "major",
    highlights: ["Complete UI redesign", "New architecture"],
    features: [
      "Completely redesigned user interface",
      "New microservices architecture",
      "Real-time collaboration features",
      "Advanced permissions system",
    ],
    fixes: [],
    breaking: [
      "API v1 endpoints deprecated",
      "New authentication flow required",
      "Database migration required",
    ],
  },
];

const typeConfig: Record<string, { label: string; color: string }> = {
  major: { label: "Major", color: "bg-red-500" },
  minor: { label: "Minor", color: "bg-blue-500" },
  patch: { label: "Patch", color: "bg-green-500" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function ReleaseNotesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Release Notes</h1>
          <p className="text-muted-foreground">
            Track changes and updates to the platform
          </p>
        </div>
        <Badge className="bg-green-500 text-white">
          <CheckCircle className="mr-1 h-3 w-3" />
          Latest: v2.4.1
        </Badge>
      </div>

      <div className="space-y-6">
        {releaseNotes.map((release) => {
          const type = typeConfig[release.type];

          return (
            <Card key={release.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Rocket className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {release.version}
                        <Badge className={`${type.color} text-white`}>
                          {type.label}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{formatDate(release.date)}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {release.highlights.map((highlight, idx) => (
                    <Badge key={idx} variant="outline">{highlight}</Badge>
                  ))}
                </div>

                {release.features.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 font-medium mb-2">
                      <Sparkles className="h-4 w-4 text-blue-500" />
                      New Features
                    </h4>
                    <ul className="space-y-1 ml-6">
                      {release.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground list-disc">{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {release.fixes.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 font-medium mb-2">
                      <Bug className="h-4 w-4 text-green-500" />
                      Bug Fixes
                    </h4>
                    <ul className="space-y-1 ml-6">
                      {release.fixes.map((fix, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground list-disc">{fix}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {release.breaking && release.breaking.length > 0 && (
                  <div className="p-3 border border-red-500 rounded-lg bg-red-50 dark:bg-red-950/20">
                    <h4 className="flex items-center gap-2 font-medium mb-2 text-red-500">
                      <AlertTriangle className="h-4 w-4" />
                      Breaking Changes
                    </h4>
                    <ul className="space-y-1 ml-6">
                      {release.breaking.map((change, idx) => (
                        <li key={idx} className="text-sm text-red-500 list-disc">{change}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
