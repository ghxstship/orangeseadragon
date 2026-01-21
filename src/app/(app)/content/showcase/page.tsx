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
import {
  Search,
  Plus,
  Award,
  Eye,
  Heart,
  Calendar,
} from "lucide-react";

interface PortfolioItem {
  id: string;
  title: string;
  client: string;
  category: string;
  date: string;
  views: number;
  likes: number;
  featured: boolean;
  tags: string[];
}

const portfolioItems: PortfolioItem[] = [
  {
    id: "1",
    title: "Summer Music Festival 2024",
    client: "Festival Productions",
    category: "Festival",
    date: "2024-06-01",
    views: 12500,
    likes: 890,
    featured: true,
    tags: ["outdoor", "music", "large-scale"],
  },
  {
    id: "2",
    title: "Tech Conference Keynote",
    client: "TechCorp Inc",
    category: "Corporate",
    date: "2024-05-15",
    views: 8900,
    likes: 456,
    featured: true,
    tags: ["corporate", "technology", "keynote"],
  },
  {
    id: "3",
    title: "Luxury Wedding Reception",
    client: "Private Client",
    category: "Wedding",
    date: "2024-04-20",
    views: 6700,
    likes: 723,
    featured: false,
    tags: ["wedding", "luxury", "intimate"],
  },
  {
    id: "4",
    title: "Product Launch Event",
    client: "StartupXYZ",
    category: "Launch",
    date: "2024-03-10",
    views: 5400,
    likes: 312,
    featured: false,
    tags: ["launch", "product", "startup"],
  },
  {
    id: "5",
    title: "Annual Charity Gala",
    client: "Foundation for Good",
    category: "Gala",
    date: "2024-02-28",
    views: 4200,
    likes: 567,
    featured: true,
    tags: ["charity", "gala", "formal"],
  },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function ShowcasePage() {
  const totalViews = portfolioItems.reduce((acc, p) => acc + p.views, 0);
  const totalLikes = portfolioItems.reduce((acc, p) => acc + p.likes, 0);
  const featuredCount = portfolioItems.filter((p) => p.featured).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Showcase</h1>
          <p className="text-muted-foreground">
            Portfolio and work showcase
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Portfolio Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalViews / 1000).toFixed(1)}K</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Likes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{(totalLikes / 1000).toFixed(1)}K</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Featured
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{featuredCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search portfolio..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Portfolio
          </CardTitle>
          <CardDescription>Showcase your best work</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {portfolioItems.map((item) => (
              <div key={item.id} className={`p-4 border rounded-lg ${item.featured ? "border-yellow-500" : ""}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{item.title}</h4>
                      {item.featured && (
                        <Badge className="bg-yellow-500 text-white">
                          <Award className="mr-1 h-3 w-3" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.client}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{item.category}</Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.date)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {item.views.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-red-500" />
                    {item.likes.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
