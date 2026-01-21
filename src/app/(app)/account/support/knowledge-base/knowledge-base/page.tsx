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
  Book,
  FileText,
  Video,
  HelpCircle,
  ExternalLink,
  Clock,
  Eye,
  Layers,
  Calendar,
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  type: "article" | "video" | "guide" | "faq";
  views: number;
  lastUpdated: string;
  readTime?: number;
}

const articles: Article[] = [
  {
    id: "1",
    title: "Getting Started with ATLVS",
    description: "Learn the basics of setting up your account and navigating the platform",
    category: "Getting Started",
    type: "guide",
    views: 12500,
    lastUpdated: "2024-06-10",
    readTime: 10,
  },
  {
    id: "2",
    title: "Creating Your First Event",
    description: "Step-by-step guide to creating and managing events",
    category: "Events",
    type: "article",
    views: 8900,
    lastUpdated: "2024-06-05",
    readTime: 8,
  },
  {
    id: "3",
    title: "Understanding Financial Reports",
    description: "Deep dive into financial reporting and analytics features",
    category: "Finance",
    type: "video",
    views: 5600,
    lastUpdated: "2024-05-28",
    readTime: 15,
  },
  {
    id: "4",
    title: "Managing Team Permissions",
    description: "How to set up roles and permissions for your team members",
    category: "Administration",
    type: "article",
    views: 4200,
    lastUpdated: "2024-06-01",
    readTime: 6,
  },
  {
    id: "5",
    title: "Frequently Asked Questions",
    description: "Answers to common questions about the platform",
    category: "Support",
    type: "faq",
    views: 15800,
    lastUpdated: "2024-06-12",
  },
  {
    id: "6",
    title: "Integrating with Third-Party Apps",
    description: "Connect ATLVS with your favorite tools and services",
    category: "Integrations",
    type: "guide",
    views: 3400,
    lastUpdated: "2024-05-20",
    readTime: 12,
  },
];

const categories = [
  { name: "Getting Started", count: 8, icon: Book },
  { name: "Events", count: 15, icon: FileText },
  { name: "Finance", count: 12, icon: FileText },
  { name: "Administration", count: 10, icon: FileText },
  { name: "Integrations", count: 6, icon: FileText },
  { name: "Support", count: 5, icon: HelpCircle },
];

const typeConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  article: { label: "Article", color: "bg-blue-500", icon: FileText },
  video: { label: "Video", color: "bg-red-500", icon: Video },
  guide: { label: "Guide", color: "bg-green-500", icon: Book },
  faq: { label: "FAQ", color: "bg-purple-500", icon: HelpCircle },
};

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export default function KnowledgeBasePage() {
  const totalArticles = articles.length;
  const totalViews = articles.reduce((acc, a) => acc + a.views, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge Base"
        description="Find answers and learn how to use the platform"
      />

      <div className="relative max-w-2xl">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search articles, guides, and FAQs..." className="pl-10 h-12 text-lg" />
      </div>

      <StatGrid columns={4}>
        <StatCard
          title="Total Articles"
          value={totalArticles}
          icon={FileText}
        />
        <StatCard
          title="Categories"
          value={categories.length}
          icon={Layers}
        />
        <StatCard
          title="Total Views"
          value={formatNumber(totalViews)}
          icon={Eye}
        />
        <StatCard
          title="Last Updated"
          value="June 12, 2024"
          icon={Calendar}
        />
      </StatGrid>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button key={category.name} variant="ghost" className="w-full justify-between">
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {category.name}
                    </span>
                    <Badge variant="outline">{category.count}</Badge>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Popular Articles</CardTitle>
            <CardDescription>Most viewed help articles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {articles.map((article) => {
                const type = typeConfig[article.type];
                const TypeIcon = type.icon;

                return (
                  <div key={article.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${type.color}`}>
                        <TypeIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{article.title}</h4>
                          <Badge className={`${type.color} text-white`}>
                            {type.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {article.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <Badge variant="outline">{article.category}</Badge>
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {formatNumber(article.views)} views
                          </span>
                          {article.readTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {article.readTime} min read
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button variant="ghost" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
