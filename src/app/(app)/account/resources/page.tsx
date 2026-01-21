"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import { BookOpen, Code, FileText, Video, ChevronRight, Library } from "lucide-react";

interface Resource {
  name: string;
  description: string;
  icon: React.ElementType;
  href: string;
  count: number;
}

const resources: Resource[] = [
  { name: "Documentation", description: "Comprehensive guides and tutorials", icon: FileText, href: "/account/resources/docs", count: 45 },
  { name: "API Reference", description: "Complete API documentation", icon: Code, href: "/account/resources/api", count: 120 },
  { name: "Video Tutorials", description: "Step-by-step video guides", icon: Video, href: "/account/resources/videos", count: 28 },
  { name: "Templates", description: "Ready-to-use templates", icon: BookOpen, href: "/account/resources/templates", count: 15 },
];

export default function AccountResourcesPage() {
  const totalResources = resources.reduce((acc, r) => acc + r.count, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resources"
        description="Learning resources and documentation"
      />

      <StatGrid columns={4}>
        <StatCard
          title="Total Resources"
          value={totalResources}
          icon={Library}
        />
        <StatCard
          title="Documentation"
          value={resources[0].count}
          icon={FileText}
        />
        <StatCard
          title="API Endpoints"
          value={resources[1].count}
          icon={Code}
        />
        <StatCard
          title="Videos"
          value={resources[2].count}
          icon={Video}
        />
      </StatGrid>

      <div className="grid gap-4 md:grid-cols-2">
        {resources.map((resource) => (
          <Link key={resource.name} href={resource.href}>
            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <resource.icon className="h-5 w-5" />
                    {resource.name}
                  </span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardTitle>
                <CardDescription>{resource.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">{resource.count} items</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
