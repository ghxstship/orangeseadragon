"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Share2, Calendar, MoreHorizontal, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SOCIAL_CONTENT_STATUS, type SocialContentStatus } from "@/lib/enums";

interface SocialPost {
  id: string;
  content: string;
  platform: string;
  status: SocialContentStatus;
  scheduledAt: string;
  engagement: string;
}

export default function ContentSocialPage() {
  const [posts, setPosts] = React.useState<SocialPost[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch("/api/v1/content/social");
        if (response.ok) {
          const result = await response.json();
          setPosts(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Social Media</h1><p className="text-muted-foreground">Social media posts and scheduling</p></div>
        <Button><Plus className="h-4 w-4 mr-2" />Create Post</Button>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Share2 className="h-5 w-5" />Posts</CardTitle><CardDescription>Social media content</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2"><Badge variant="outline">{post.platform}</Badge><Badge variant={post.status === SOCIAL_CONTENT_STATUS.PUBLISHED ? "default" : post.status === SOCIAL_CONTENT_STATUS.SCHEDULED ? "secondary" : "outline"}>{post.status}</Badge></div>
                  <p className="font-medium mt-1">{post.content}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    {post.scheduledAt !== "-" && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{post.scheduledAt}</span>}
                    {post.engagement !== "-" && <span>Engagement: {post.engagement}</span>}
                  </div>
                </div>
                <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end"><DropdownMenuItem>Edit</DropdownMenuItem><DropdownMenuItem>Duplicate</DropdownMenuItem><DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem></DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
