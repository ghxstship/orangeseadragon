"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  Building2,
  Users,
  Settings,
  Palette,
  GitBranch,
  Shield,
  Plug,
  ChevronRight,
  Crown,
} from "lucide-react";

interface OrganizationSection {
  name: string;
  description: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
}

const organizationSections: OrganizationSection[] = [
  {
    name: "Branding",
    description: "Customize logos, colors, and brand identity",
    icon: Palette,
    href: "/account/organization/branding",
  },
  {
    name: "Departments",
    description: "Manage organizational departments and teams",
    icon: GitBranch,
    href: "/account/organization/departments",
  },
  {
    name: "Roles & Permissions",
    description: "Configure user roles and access levels",
    icon: Shield,
    href: "/account/organization/roles",
  },
  {
    name: "Custom Fields",
    description: "Define custom data fields for your organization",
    icon: Settings,
    href: "/account/organization/fields",
  },
  {
    name: "Integrations",
    description: "Connect third-party services and apps",
    icon: Plug,
    href: "/account/organization/integrations",
    badge: "3 active",
  },
  {
    name: "Settings",
    description: "General organization settings and preferences",
    icon: Settings,
    href: "/account/organization/settings",
  },
];

export default function AccountOrganizationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization"
        description="Manage your organization settings and configuration"
        actions={
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            General Settings
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Organization"
          value="Events Pro Inc"
          icon={Building2}
        />
        <StatCard
          title="Team Size"
          value="24 members"
          icon={Users}
        />
        <StatCard
          title="Plan"
          value="Professional"
          valueClassName="text-blue-500"
          icon={Crown}
        />
        <StatCard
          title="Departments"
          value={6}
          icon={GitBranch}
        />
      </StatGrid>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Organization Settings
          </CardTitle>
          <CardDescription>
            Configure your organization&apos;s structure, branding, and integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {organizationSections.map((section) => (
              <Link key={section.name} href={section.href}>
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <section.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{section.name}</h4>
                        {section.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {section.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
