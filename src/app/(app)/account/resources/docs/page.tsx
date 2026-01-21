"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  FileText,
  Search,
  BookOpen,
  Video,
  Code,
  HelpCircle,
  Clock,
  Eye,
  ChevronRight,
} from "lucide-react";

interface DocArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  views: number;
  updated: string;
  type: "guide" | "tutorial" | "reference" | "faq";
}

const docs: DocArticle[] = [
  {
    id: "1",
    title: "Getting Started",
    description: "Quick start guide for new users - set up your account and create your first event",
    category: "Basics",
    readTime: "5 min",
    views: 2456,
    updated: "2024-06-10",
    type: "guide",
  },
  {
    id: "2",
    title: "Event Management",
    description: "How to create, manage, and track events from start to finish",
    category: "Events",
    readTime: "12 min",
    views: 1892,
    updated: "2024-06-08",
    type: "guide",
  },
  {
    id: "3",
    title: "Team Collaboration",
    description: "Working with your team - roles, permissions, and communication",
    category: "Teams",
    readTime: "8 min",
    views: 1234,
    updated: "2024-06-05",
    type: "tutorial",
  },
  {
    id: "4",
    title: "Billing & Payments",
    description: "Understanding billing cycles, invoices, and payment methods",
    category: "Billing",
    readTime: "6 min",
    views: 987,
    updated: "2024-06-01",
    type: "guide",
  },
  {
    id: "5",
    title: "API Integration Guide",
    description: "Connect your systems using our REST API",
    category: "Developer",
    readTime: "15 min",
    views: 756,
    updated: "2024-05-28",
    type: "reference",
  },
  {
    id: "6",
    title: "Frequently Asked Questions",
    description: "Common questions and answers about the platform",
    category: "Support",
    readTime: "10 min",
    views: 2100,
    updated: "2024-06-12",
    type: "faq",
  },
];

const typeConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  guide: { label: "Guide", color: "bg-blue-500", icon: BookOpen },
  tutorial: { label: "Tutorial", color: "bg-green-500", icon: Video },
  reference: { label: "Reference", color: "bg-purple-500", icon: Code },
  faq: { label: "FAQ", color: "bg-orange-500", icon: HelpCircle },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AccountResourcesDocsPage() {
  const totalViews = docs.reduce((acc, d) => acc + d.views, 0);
  const categories = Array.from(new Set(docs.map((d) => d.category)));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documentation"
        description="Guides, tutorials, and reference documentation"
      />

      <StatGrid columns={4}>
        <StatCard
          title="Total Articles"
          value={docs.length}
          icon={FileText}
        />
        <StatCard
          title="Categories"
          value={categories.length}
          icon={BookOpen}
        />
        <StatCard
          title="Total Views"
          value={totalViews.toLocaleString()}
          icon={Eye}
        />
        <StatCard
          title="Avg Read Time"
          value="9 min"
          icon={Clock}
        />
      </StatGrid>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search documentation..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            All Documentation
          </CardTitle>
          <CardDescription>Browse guides and tutorials</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {docs.map((doc) => {
              const type = typeConfig[doc.type];
              const TypeIcon = type.icon;

              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${type.color}`}>
                      <TypeIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{doc.title}</h4>
                        <Badge className={`${type.color} text-white`}>
                          {type.label}
                        </Badge>
                        <Badge variant="outline">{doc.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {doc.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {doc.readTime} read
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {doc.views.toLocaleString()} views
                        </span>
                        <span>Updated {formatDate(doc.updated)}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
