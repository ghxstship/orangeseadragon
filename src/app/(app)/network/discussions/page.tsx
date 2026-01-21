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
  Plus,
  MessageSquare,
  ThumbsUp,
  MessageCircle,
  Eye,
  Pin,
  CheckCircle,
  Layers,
} from "lucide-react";

interface Discussion {
  id: string;
  title: string;
  author: string;
  category: string;
  createdAt: string;
  replies: number;
  views: number;
  likes: number;
  pinned: boolean;
  solved: boolean;
}

const discussions: Discussion[] = [
  {
    id: "1",
    title: "Best practices for large-scale event setup",
    author: "Sarah Chen",
    category: "Operations",
    createdAt: "2024-06-14",
    replies: 23,
    views: 456,
    likes: 45,
    pinned: true,
    solved: false,
  },
  {
    id: "2",
    title: "How to handle last-minute vendor cancellations?",
    author: "Mike Johnson",
    category: "Vendors",
    createdAt: "2024-06-13",
    replies: 18,
    views: 312,
    likes: 32,
    pinned: false,
    solved: true,
  },
  {
    id: "3",
    title: "Tips for managing crew during multi-day festivals",
    author: "Emily Watson",
    category: "Crew",
    createdAt: "2024-06-12",
    replies: 34,
    views: 567,
    likes: 67,
    pinned: false,
    solved: false,
  },
  {
    id: "4",
    title: "New sustainability requirements - discussion",
    author: "David Park",
    category: "Compliance",
    createdAt: "2024-06-11",
    replies: 12,
    views: 234,
    likes: 21,
    pinned: true,
    solved: false,
  },
  {
    id: "5",
    title: "Integration with payment processors",
    author: "Lisa Brown",
    category: "Technical",
    createdAt: "2024-06-10",
    replies: 8,
    views: 189,
    likes: 15,
    pinned: false,
    solved: true,
  },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function DiscussionsPage() {
  const totalReplies = discussions.reduce((acc, d) => acc + d.replies, 0);
  const solvedCount = discussions.filter((d) => d.solved).length;
  const categories = Array.from(new Set(discussions.map((d) => d.category)));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Discussions"
        description="Community forums and discussions"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Discussion
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Total Discussions"
          value={discussions.length}
          icon={MessageSquare}
        />
        <StatCard
          title="Total Replies"
          value={totalReplies}
          icon={MessageCircle}
        />
        <StatCard
          title="Solved"
          value={solvedCount}
          valueClassName="text-green-500"
          icon={CheckCircle}
        />
        <StatCard
          title="Categories"
          value={categories.length}
          icon={Layers}
        />
      </StatGrid>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search discussions..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Discussions
          </CardTitle>
          <CardDescription>Community conversations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <div key={discussion.id} className={`p-4 border rounded-lg ${discussion.pinned ? "border-l-4 border-l-blue-500" : ""}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {discussion.pinned && (
                        <Pin className="h-4 w-4 text-blue-500" />
                      )}
                      <h4 className="font-medium">{discussion.title}</h4>
                      {discussion.solved && (
                        <Badge className="bg-green-500 text-white">Solved</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <span>by {discussion.author}</span>
                      <span>•</span>
                      <Badge variant="outline">{discussion.category}</Badge>
                      <span>•</span>
                      <span>{formatDate(discussion.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    {discussion.replies} replies
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {discussion.views} views
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    {discussion.likes}
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
