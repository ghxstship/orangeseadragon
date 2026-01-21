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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  MoreHorizontal,
  Image,
  FileText,
  Video,
  Music,
  Eye,
} from "lucide-react";
import { CONTENT_STATUS, type ContentStatus } from "@/lib/enums";

interface ContentItem {
  id: string;
  name: string;
  type: "image" | "video" | "document" | "audio";
  category: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  views: number;
  status: ContentStatus;
}

const contentItems: ContentItem[] = [
  {
    id: "1",
    name: "Summer Festival Banner",
    type: "image",
    category: "Marketing",
    size: "2.4 MB",
    uploadedBy: "Sarah Chen",
    uploadedAt: "2024-06-10",
    views: 1250,
    status: CONTENT_STATUS.PUBLISHED,
  },
  {
    id: "2",
    name: "Event Promo Video",
    type: "video",
    category: "Marketing",
    size: "156 MB",
    uploadedBy: "Mike Johnson",
    uploadedAt: "2024-06-08",
    views: 3400,
    status: CONTENT_STATUS.PUBLISHED,
  },
  {
    id: "3",
    name: "Brand Guidelines 2024",
    type: "document",
    category: "Brand",
    size: "8.5 MB",
    uploadedBy: "Emily Watson",
    uploadedAt: "2024-05-15",
    views: 890,
    status: CONTENT_STATUS.PUBLISHED,
  },
  {
    id: "4",
    name: "Background Music Pack",
    type: "audio",
    category: "Media",
    size: "45 MB",
    uploadedBy: "David Park",
    uploadedAt: "2024-06-01",
    views: 560,
    status: CONTENT_STATUS.PUBLISHED,
  },
  {
    id: "5",
    name: "Social Media Templates",
    type: "image",
    category: "Social",
    size: "12 MB",
    uploadedBy: "Lisa Brown",
    uploadedAt: "2024-06-12",
    views: 234,
    status: CONTENT_STATUS.DRAFT,
  },
];

const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  image: { icon: Image, color: "bg-green-500" },
  video: { icon: Video, color: "bg-purple-500" },
  document: { icon: FileText, color: "bg-blue-500" },
  audio: { icon: Music, color: "bg-orange-500" },
};

const statusConfig: Record<ContentStatus, { label: string; color: string }> = {
  [CONTENT_STATUS.PUBLISHED]: { label: "Published", color: "bg-green-500" },
  [CONTENT_STATUS.DRAFT]: { label: "Draft", color: "bg-yellow-500" },
  [CONTENT_STATUS.ARCHIVED]: { label: "Archived", color: "bg-gray-500" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function ContentPage() {
  const publishedCount = contentItems.filter((c) => c.status === CONTENT_STATUS.PUBLISHED).length;
  const totalViews = contentItems.reduce((acc, c) => acc + c.views, 0);
  const categories = Array.from(new Set(contentItems.map((c) => c.category)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content</h1>
          <p className="text-muted-foreground">
            Digital asset and content management
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Upload Content
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Published
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{publishedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search content..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image className="h-5 w-5" />
            Content Library
          </CardTitle>
          <CardDescription>All digital assets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contentItems.map((item) => {
              const type = typeConfig[item.type];
              const status = statusConfig[item.status];
              const TypeIcon = type.icon;

              return (
                <div key={item.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${type.color}`}>
                        <TypeIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{item.name}</h4>
                          <Badge className={`${status.color} text-white`}>
                            {status.label}
                          </Badge>
                          <Badge variant="outline">{item.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.size} • Uploaded by {item.uploadedBy}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{formatDate(item.uploadedAt)}</span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {item.views.toLocaleString()} views
                          </span>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Preview</DropdownMenuItem>
                        <DropdownMenuItem>Download</DropdownMenuItem>
                        <DropdownMenuItem>Edit Details</DropdownMenuItem>
                        <DropdownMenuItem>Share</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
