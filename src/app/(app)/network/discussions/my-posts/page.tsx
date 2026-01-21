"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, MoreHorizontal, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface MyPost {
  id: string;
  title: string;
  category: string;
  replies: number;
  views: number;
  created_at: string;
}

export default function DiscussionsMyPostsPage() {
  const [myPosts, setMyPosts] = React.useState<MyPost[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchMyPosts() {
      try {
        const response = await fetch("/api/v1/network/discussions/my-posts");
        if (response.ok) {
          const result = await response.json();
          setMyPosts(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch my posts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMyPosts();
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
      <div><h1 className="text-3xl font-bold tracking-tight">My Posts</h1><p className="text-muted-foreground">Your discussion posts</p></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" />Your Discussions</CardTitle><CardDescription>Posts you have created</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myPosts.map((post) => (
              <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2"><h4 className="font-medium">{post.title}</h4><Badge variant="outline">{post.category}</Badge></div>
                  <p className="text-sm text-muted-foreground mt-1">{post.replies} replies • {post.views} views • Created {post.created_at}</p>
                </div>
                <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end"><DropdownMenuItem>View</DropdownMenuItem><DropdownMenuItem>Edit</DropdownMenuItem><DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem></DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
