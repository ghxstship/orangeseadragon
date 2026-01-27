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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/common";
import {
  MoreHorizontal,
  Pin,
  Calendar,
  Users,
  FileText,
  Building,
  ExternalLink,
  GripVertical,
  Loader2,
} from "lucide-react";

interface PinnedItem {
  id: string;
  name: string;
  type: "event" | "contact" | "vendor" | "document" | "page";
  path: string;
  pinned_at: string;
  order: number;
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  event: { icon: Calendar, color: "bg-blue-500", label: "Event" },
  contact: { icon: Users, color: "bg-green-500", label: "Contact" },
  vendor: { icon: Building, color: "bg-purple-500", label: "Vendor" },
  document: { icon: FileText, color: "bg-gray-500", label: "Document" },
  page: { icon: FileText, color: "bg-indigo-500", label: "Page" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function PinnedPage() {
  const [pinnedItems, setPinnedItems] = React.useState<PinnedItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchPinnedItems() {
      try {
        const response = await fetch("/api/v1/work/pinned");
        if (response.ok) {
          const result = await response.json();
          setPinnedItems(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch pinned items:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPinnedItems();
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
      <PageHeader
        title="Pinned Items"
        description="Your pinned items for quick navigation"
        actions={<Pin className="h-8 w-8 text-primary" />}
      />

      <Card>
        <CardHeader>
          <CardTitle>Pinned</CardTitle>
          <CardDescription>Drag to reorder your pinned items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {pinnedItems.map((item) => {
              const type = typeConfig[item.type];
              const TypeIcon = type.icon;

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <Pin className="h-4 w-4 text-primary" />
                    <div className={`p-2 rounded-lg ${type.color}`}>
                      <TypeIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{item.name}</h4>
                        <Badge variant="outline">{type.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Pinned {formatDate(item.pinned_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Open</DropdownMenuItem>
                        <DropdownMenuItem>Move Up</DropdownMenuItem>
                        <DropdownMenuItem>Move Down</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Pin className="mr-2 h-4 w-4" />
                          Unpin
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Pinned items appear in your sidebar for quick access</p>
          <p>• Drag items to reorder them</p>
          <p>• Right-click any item in the app to pin it</p>
          <p>• You can pin up to 10 items</p>
        </CardContent>
      </Card>
    </div>
  );
}
