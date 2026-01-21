"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  Search,
  Code,
  Book,
  Zap,
  Key,
  ExternalLink,
  FileCode,
  Terminal,
  Clock,
  Layers,
} from "lucide-react";

interface DocSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  articles: number;
  updated: string;
}

const docSections: DocSection[] = [
  {
    id: "1",
    title: "Getting Started",
    description: "Quick start guides and authentication setup",
    icon: Zap,
    articles: 8,
    updated: "2024-06-15",
  },
  {
    id: "2",
    title: "REST API Reference",
    description: "Complete API documentation with examples",
    icon: Code,
    articles: 45,
    updated: "2024-06-14",
  },
  {
    id: "3",
    title: "Webhooks",
    description: "Real-time event notifications and callbacks",
    icon: Terminal,
    articles: 12,
    updated: "2024-06-10",
  },
  {
    id: "4",
    title: "Authentication",
    description: "OAuth 2.0, API keys, and security best practices",
    icon: Key,
    articles: 10,
    updated: "2024-06-12",
  },
  {
    id: "5",
    title: "SDKs & Libraries",
    description: "Official client libraries for popular languages",
    icon: FileCode,
    articles: 6,
    updated: "2024-06-08",
  },
  {
    id: "6",
    title: "Guides & Tutorials",
    description: "Step-by-step integration guides",
    icon: Book,
    articles: 15,
    updated: "2024-06-13",
  },
];

const quickLinks = [
  { title: "API Authentication", path: "/docs/auth" },
  { title: "Create an Event", path: "/docs/events/create" },
  { title: "List Contacts", path: "/docs/contacts/list" },
  { title: "Process Payment", path: "/docs/payments/process" },
  { title: "Webhook Events", path: "/docs/webhooks/events" },
  { title: "Error Handling", path: "/docs/errors" },
];

const sdks = [
  { name: "JavaScript/Node.js", version: "2.5.0", status: "stable" },
  { name: "Python", version: "2.4.1", status: "stable" },
  { name: "Ruby", version: "2.3.0", status: "stable" },
  { name: "PHP", version: "2.2.0", status: "stable" },
  { name: "Go", version: "1.1.0", status: "beta" },
  { name: "Java", version: "2.0.0", status: "stable" },
];

export default function DeveloperDocsPage() {
  const totalArticles = docSections.reduce((acc, s) => acc + s.articles, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Developer Documentation"
        description="API reference, SDKs, and integration guides"
        actions={
          <Button>
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Full Docs
          </Button>
        }
      />

      <div className="relative max-w-2xl">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search documentation..." className="pl-10 h-12 text-lg" />
      </div>

      <StatGrid columns={4}>
        <StatCard
          title="API Version"
          value="v2.5"
          icon={Code}
        />
        <StatCard
          title="Documentation"
          value={`${totalArticles} articles`}
          icon={Book}
        />
        <StatCard
          title="SDKs Available"
          value={`${sdks.length} languages`}
          icon={Layers}
        />
        <StatCard
          title="Last Updated"
          value="June 15, 2024"
          icon={Clock}
        />
      </StatGrid>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {docSections.map((section) => {
          const Icon = section.icon;

          return (
            <Card key={section.id} className="hover:border-primary cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription>{section.articles} articles</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Popular documentation pages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              {quickLinks.map((link, idx) => (
                <Button key={idx} variant="outline" className="justify-start">
                  <Code className="mr-2 h-4 w-4" />
                  {link.title}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Official SDKs</CardTitle>
            <CardDescription>Client libraries for popular languages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sdks.map((sdk, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{sdk.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">v{sdk.version}</Badge>
                    <Badge className={sdk.status === "stable" ? "bg-green-500" : "bg-yellow-500"}>
                      {sdk.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Quick Start
          </CardTitle>
          <CardDescription>Get started with the ATLVS API in minutes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg font-mono text-sm">
            <p className="text-muted-foreground"># Install the SDK</p>
            <p>npm install @atlvs/sdk</p>
            <br />
            <p className="text-muted-foreground"># Initialize the client</p>
            <p>{`import { ATLVS } from '@atlvs/sdk';`}</p>
            <p>{`const client = new ATLVS({ apiKey: 'your_api_key' });`}</p>
            <br />
            <p className="text-muted-foreground"># Make your first API call</p>
            <p>{`const events = await client.events.list();`}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
