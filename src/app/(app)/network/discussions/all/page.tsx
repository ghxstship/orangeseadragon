"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, MessageSquare, MoreHorizontal, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Discussion {
  id: string;
  title: string;
  category: string;
  author: string;
  replies: number;
  views: number;
  last_activity: string;
}

export default function DiscussionsAllPage() {
  const [discussions, setDiscussions] = React.useState<Discussion[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchDiscussions() {
      try {
        const response = await fetch("/api/v1/network/discussions/all");
        if (response.ok) {
          const result = await response.json();
          setDiscussions(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch discussions:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDiscussions();
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
        <div><h1 className="text-3xl font-bold tracking-tight">Discussions</h1><p className="text-muted-foreground">Community discussions</p></div>
        <Button><Plus className="h-4 w-4 mr-2" />New Discussion</Button>
      </div>
      <div className="flex items-center gap-4"><div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search discussions..." className="pl-9" /></div></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" />All Discussions</CardTitle><CardDescription>Browse all topics</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <div key={discussion.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <div>
                  <div className="flex items-center gap-2"><h4 className="font-medium">{discussion.title}</h4><Badge variant="outline">{discussion.category}</Badge></div>
                  <p className="text-sm text-muted-foreground mt-1">By {discussion.author} • {discussion.replies} replies • {discussion.views} views • {discussion.last_activity}</p>
                </div>
                <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end"><DropdownMenuItem>View</DropdownMenuItem><DropdownMenuItem>Follow</DropdownMenuItem><DropdownMenuItem>Report</DropdownMenuItem></DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
