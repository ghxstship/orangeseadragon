"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  Search,
  Plus,
  Users,
  MessageSquare,
  Heart,
  Share2,
  MoreHorizontal,
  TrendingUp,
  Calendar,
  Activity,
  FileText,
} from "lucide-react";

interface CommunityPost {
  id: string;
  author: string;
  authorRole: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  tags: string[];
  isPinned?: boolean;
}

const posts: CommunityPost[] = [
  {
    id: "1",
    author: "Sarah Chen",
    authorRole: "Community Manager",
    content: "Excited to announce our Summer Festival 2024 lineup! Early bird tickets go on sale next week. Who's ready? 🎉",
    timestamp: "2024-01-15T10:30:00Z",
    likes: 245,
    comments: 42,
    shares: 18,
    tags: ["announcement", "summer-festival"],
    isPinned: true,
  },
  {
    id: "2",
    author: "Mike Johnson",
    authorRole: "Event Coordinator",
    content: "Behind the scenes look at our stage setup for the upcoming corporate gala. The lighting design is going to be incredible!",
    timestamp: "2024-01-14T16:00:00Z",
    likes: 128,
    comments: 15,
    shares: 8,
    tags: ["behind-the-scenes", "production"],
  },
  {
    id: "3",
    author: "Emily Watson",
    authorRole: "Marketing Lead",
    content: "Thank you to everyone who attended our community meetup last weekend! Great discussions about the future of live events.",
    timestamp: "2024-01-13T12:00:00Z",
    likes: 89,
    comments: 23,
    shares: 5,
    tags: ["community", "meetup"],
  },
  {
    id: "4",
    author: "Tom Wilson",
    authorRole: "Technical Director",
    content: "Pro tip: Always do a full technical rehearsal at least 24 hours before your event. It saves so much stress on the day!",
    timestamp: "2024-01-12T09:00:00Z",
    likes: 156,
    comments: 31,
    shares: 45,
    tags: ["tips", "production"],
  },
  {
    id: "5",
    author: "Lisa Park",
    authorRole: "Artist Relations",
    content: "Just confirmed an amazing headliner for our New Year's Eve concert. Announcement coming soon! 🎤",
    timestamp: "2024-01-11T14:30:00Z",
    likes: 312,
    comments: 67,
    shares: 28,
    tags: ["announcement", "nye-concert"],
  },
];

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatNumber(num: number): string {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export default function CommunityPage() {
  const totalMembers = 1250;
  const activeToday = 156;
  const totalPosts = posts.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Community"
        description="Connect with your community members"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Total Members"
          value={formatNumber(totalMembers)}
          icon={Users}
        />
        <StatCard
          title="Active Today"
          value={activeToday}
          valueClassName="text-green-500"
          icon={Activity}
        />
        <StatCard
          title="Posts This Week"
          value={totalPosts}
          icon={FileText}
        />
        <StatCard
          title="Engagement Rate"
          value="12.5%"
          valueClassName="text-blue-500"
          icon={TrendingUp}
        />
      </StatGrid>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search posts..." className="pl-9" />
        </div>
        <Button variant="outline" size="sm">
          <Users className="mr-2 h-4 w-4" />
          Members
        </Button>
        <Button variant="outline" size="sm">
          <Calendar className="mr-2 h-4 w-4" />
          Events
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className={`hover:shadow-md transition-shadow ${post.isPinned ? "border-primary" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{getInitials(post.author)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{post.author}</span>
                          {post.isPinned && (
                            <Badge variant="outline" className="text-xs">Pinned</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {post.authorRole} • {formatRelativeTime(post.timestamp)}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Post</DropdownMenuItem>
                          <DropdownMenuItem>{post.isPinned ? "Unpin" : "Pin"} Post</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className="mt-3">{post.content}</p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-6 mt-4 pt-4 border-t">
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <Heart className="mr-1 h-4 w-4" />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <MessageSquare className="mr-1 h-4 w-4" />
                        {post.comments}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <Share2 className="mr-1 h-4 w-4" />
                        {post.shares}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trending Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["#summer-festival", "#production", "#behind-the-scenes", "#tips", "#community"].map((tag, idx) => (
                  <div key={tag} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary">{tag}</span>
                    <span className="text-xs text-muted-foreground">{(50 - idx * 8)} posts</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Contributors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Sarah Chen", posts: 24 },
                  { name: "Mike Johnson", posts: 18 },
                  { name: "Emily Watson", posts: 15 },
                  { name: "Tom Wilson", posts: 12 },
                  { name: "Lisa Park", posts: 10 },
                ].map((contributor) => (
                  <div key={contributor.name} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{getInitials(contributor.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{contributor.name}</p>
                      <p className="text-xs text-muted-foreground">{contributor.posts} posts</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
