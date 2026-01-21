"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  Cpu,
  Key,
  Globe,
  Download,
  Webhook,
  ToggleRight,
  Code,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface PlatformSection {
  name: string;
  description: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive";
}

const platformSections: PlatformSection[] = [
  {
    name: "API Keys",
    description: "Manage API keys for programmatic access",
    icon: Key,
    href: "/account/platform/api-keys",
    badge: "3 active",
  },
  {
    name: "Custom Domains",
    description: "Configure custom domains for your organization",
    icon: Globe,
    href: "/account/platform/domains",
    badge: "2 configured",
  },
  {
    name: "Webhooks",
    description: "Set up webhook endpoints for real-time notifications",
    icon: Webhook,
    href: "/account/platform/webhooks",
    badge: "5 active",
  },
  {
    name: "Feature Flags",
    description: "Enable or disable platform features",
    icon: ToggleRight,
    href: "/account/platform/features",
  },
  {
    name: "Data Export",
    description: "Export your data in various formats",
    icon: Download,
    href: "/account/platform/export",
    badge: "12 this month",
    badgeVariant: "secondary",
  },
];

export default function AccountPlatformPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform"
        description="Platform settings and developer tools"
        actions={
          <Button>
            <Code className="h-4 w-4 mr-2" />
            API Documentation
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="API Keys"
          value="3 active"
          icon={Key}
        />
        <StatCard
          title="Domains"
          value="2 configured"
          icon={Globe}
        />
        <StatCard
          title="Webhooks"
          value="5 active"
          icon={Webhook}
        />
        <StatCard
          title="Exports"
          value="12 this month"
          icon={Download}
        />
      </StatGrid>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Developer Tools
          </CardTitle>
          <CardDescription>
            Access platform features, APIs, and developer resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {platformSections.map((section) => (
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
                          <Badge variant={section.badgeVariant || "secondary"} className="text-xs">
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

      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>Helpful developer resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="justify-start h-auto py-4">
              <Code className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">API Reference</div>
                <div className="text-xs text-muted-foreground">Complete API documentation</div>
              </div>
              <ExternalLink className="h-4 w-4 ml-auto" />
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4">
              <Cpu className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">SDKs & Libraries</div>
                <div className="text-xs text-muted-foreground">Official client libraries</div>
              </div>
              <ExternalLink className="h-4 w-4 ml-auto" />
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4">
              <Webhook className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Webhook Events</div>
                <div className="text-xs text-muted-foreground">Event types reference</div>
              </div>
              <ExternalLink className="h-4 w-4 ml-auto" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
