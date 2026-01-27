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
  Clock,
  Calendar,
  Users,
  FileText,
  Building,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface RecentItem {
  id: string;
  name: string;
  type: "event" | "contact" | "vendor" | "document" | "invoice";
  path: string;
  accessed_at: string;
  action: "viewed" | "edited" | "created";
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  event: { icon: Calendar, color: "bg-blue-500", label: "Event" },
  contact: { icon: Users, color: "bg-green-500", label: "Contact" },
  vendor: { icon: Building, color: "bg-purple-500", label: "Vendor" },
  document: { icon: FileText, color: "bg-gray-500", label: "Document" },
  invoice: { icon: FileText, color: "bg-orange-500", label: "Invoice" },
};

const actionConfig: Record<string, { label: string; color: string }> = {
  viewed: { label: "Viewed", color: "bg-gray-500" },
  edited: { label: "Edited", color: "bg-blue-500" },
  created: { label: "Created", color: "bg-green-500" },
};

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

export default function RecentPage() {
  const [recentItems, setRecentItems] = React.useState<RecentItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchRecentItems() {
      try {
        const response = await fetch("/api/v1/work/recent");
        if (response.ok) {
          const result = await response.json();
          setRecentItems(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch recent items:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRecentItems();
  }, []);

  const todayItems = recentItems.filter((i) => {
    const date = new Date(i.accessed_at);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }).length;

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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recent</h1>
          <p className="text-muted-foreground">
            Items you&apos;ve recently accessed
          </p>
        </div>
        <Clock className="h-8 w-8 text-muted-foreground" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Recent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{todayItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Edited
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {recentItems.filter((i) => i.action === "edited").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Created
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {recentItems.filter((i) => i.action === "created").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search recent items..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recently Accessed</CardTitle>
          <CardDescription>Your recent activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentItems.map((item) => {
              const type = typeConfig[item.type];
              const action = actionConfig[item.action];
              const TypeIcon = type.icon;

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${type.color}`}>
                      <TypeIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{item.name}</h4>
                        <Badge variant="outline">{type.label}</Badge>
                        <Badge className={`${action.color} text-white`}>
                          {action.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(item.accessed_at)}
                      </p>
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
  );
}
