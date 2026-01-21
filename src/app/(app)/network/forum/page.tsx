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
  MessageSquare,
  ThumbsUp,
  Eye,
  Pin,
  CheckCircle,
  User,
} from "lucide-react";

interface ForumPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  authorAvatar?: string;
  createdAt: string;
  replies: number;
  views: number;
  likes: number;
  isPinned?: boolean;
  isSolved?: boolean;
}

const forumPosts: ForumPost[] = [
  {
    id: "1",
    title: "Best practices for large-scale event management",
    excerpt: "Looking for tips on managing events with 10,000+ attendees. What are your experiences?",
    category: "Events",
    author: "Sarah Chen",
    createdAt: "2024-06-15",
    replies: 24,
    views: 1250,
    likes: 45,
    isPinned: true,
  },
  {
    id: "2",
    title: "How to set up automated invoice reminders?",
    excerpt: "I want to automatically send reminders for overdue invoices. Is this possible?",
    category: "Finance",
    author: "Mike Johnson",
    createdAt: "2024-06-14",
    replies: 8,
    views: 320,
    likes: 12,
    isSolved: true,
  },
  {
    id: "3",
    title: "Integration with Zapier - Step by step guide",
    excerpt: "I've created a comprehensive guide for integrating ATLVS with Zapier workflows",
    category: "Integrations",
    author: "Emily Watson",
    createdAt: "2024-06-13",
    replies: 15,
    views: 890,
    likes: 67,
    isPinned: true,
  },
  {
    id: "4",
    title: "Custom report templates - Share yours!",
    excerpt: "Let's share our custom report templates. Here are some I've created for venue management.",
    category: "Reporting",
    author: "David Park",
    createdAt: "2024-06-12",
    replies: 32,
    views: 1100,
    likes: 89,
  },
  {
    id: "5",
    title: "Mobile app not syncing properly",
    excerpt: "Anyone else having issues with the mobile app not syncing data in real-time?",
    category: "Technical",
    author: "Alex Kim",
    createdAt: "2024-06-11",
    replies: 6,
    views: 180,
    likes: 3,
    isSolved: true,
  },
];

const categories = [
  { name: "All Topics", count: 156 },
  { name: "Events", count: 45 },
  { name: "Finance", count: 28 },
  { name: "Integrations", count: 22 },
  { name: "Reporting", count: 18 },
  { name: "Technical", count: 32 },
  { name: "Feature Ideas", count: 11 },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
}

export default function CommunityForumPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community Forum</h1>
          <p className="text-muted-foreground">
            Connect with other users and share knowledge
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Topic
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Replies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,245</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">892</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Online Now
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">47</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search topics..." className="pl-9" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {categories.map((category) => (
                <Button key={category.name} variant="ghost" className="w-full justify-between">
                  <span>{category.name}</span>
                  <Badge variant="outline">{category.count}</Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Discussions</CardTitle>
            <CardDescription>Latest topics from the community</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {forumPosts.map((post) => (
                <div key={post.id} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {post.isPinned && (
                          <Pin className="h-4 w-4 text-orange-500" />
                        )}
                        <h4 className="font-medium">{post.title}</h4>
                        {post.isSolved && (
                          <Badge className="bg-green-500 text-white">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Solved
                          </Badge>
                        )}
                        <Badge variant="outline">{post.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{post.author}</span>
                        <span>{formatDate(post.createdAt)}</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {post.replies}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {formatNumber(post.views)}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          {post.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
