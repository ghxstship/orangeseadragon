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
import { Input } from "@/components/ui/input";
import {
  Search,
  BookOpen,
  Video,
  MessageCircle,
  Mail,
  Phone,
  ExternalLink,
  ChevronRight,
  FileText,
  Zap,
  Users,
  Calendar,
  Package,
  DollarSign,
} from "lucide-react";

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  articles: number;
}

interface HelpArticle {
  id: string;
  title: string;
  category: string;
  views: number;
}

const categories: HelpCategory[] = [
  { id: "1", title: "Getting Started", description: "Learn the basics of ATLVS", icon: Zap, articles: 12 },
  { id: "2", title: "Projects & Tasks", description: "Manage your work effectively", icon: FileText, articles: 18 },
  { id: "3", title: "Team Management", description: "Collaborate with your team", icon: Users, articles: 15 },
  { id: "4", title: "Events & Calendar", description: "Schedule and plan events", icon: Calendar, articles: 22 },
  { id: "5", title: "Assets & Inventory", description: "Track equipment and resources", icon: Package, articles: 14 },
  { id: "6", title: "Finance & Billing", description: "Manage budgets and invoices", icon: DollarSign, articles: 16 },
];

const popularArticles: HelpArticle[] = [
  { id: "1", title: "How to create your first project", category: "Getting Started", views: 1250 },
  { id: "2", title: "Setting up team permissions", category: "Team Management", views: 980 },
  { id: "3", title: "Creating and managing events", category: "Events & Calendar", views: 875 },
  { id: "4", title: "Asset check-out workflow", category: "Assets & Inventory", views: 720 },
  { id: "5", title: "Generating financial reports", category: "Finance & Billing", views: 650 },
  { id: "6", title: "Integrating with external calendars", category: "Events & Calendar", views: 580 },
];

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">How can we help?</h1>
        <p className="text-muted-foreground mt-2">
          Search our knowledge base or browse categories below
        </p>
        <div className="relative mt-6">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for help articles..."
            className="pl-12 h-12 text-lg"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <CardTitle className="mt-4">{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {category.articles} articles
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Popular Articles
            </CardTitle>
            <CardDescription>Most viewed help articles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularArticles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div>
                    <h4 className="font-medium">{article.title}</h4>
                    <p className="text-sm text-muted-foreground">{article.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{article.views} views</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Tutorials
              </CardTitle>
              <CardDescription>Learn through step-by-step videos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  "Platform Overview (5 min)",
                  "Creating Your First Event (8 min)",
                  "Team Collaboration Features (6 min)",
                  "Asset Management Basics (7 min)",
                ].map((video, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/50 cursor-pointer"
                  >
                    <span className="text-sm">{video}</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Videos
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Contact Support
              </CardTitle>
              <CardDescription>Get help from our team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-muted-foreground">support@atlvs.io</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <MessageCircle className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Live Chat</p>
                    <p className="text-sm text-muted-foreground">Available 9am - 6pm EST</p>
                  </div>
                </div>
              </div>
              <Button className="w-full mt-4">
                Start Live Chat
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
