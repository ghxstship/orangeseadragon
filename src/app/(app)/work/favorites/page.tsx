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
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  Search,
  MoreHorizontal,
  Star,
  Calendar,
  Users,
  FileText,
  Building,
  ExternalLink,
} from "lucide-react";

interface FavoriteItem {
  id: string;
  name: string;
  type: "event" | "contact" | "vendor" | "document" | "report";
  path: string;
  addedAt: string;
}

const favoriteItems: FavoriteItem[] = [
  {
    id: "1",
    name: "Summer Music Festival 2024",
    type: "event",
    path: "/events/evt_123",
    addedAt: "2024-06-10",
  },
  {
    id: "2",
    name: "John Smith",
    type: "contact",
    path: "/contacts/con_456",
    addedAt: "2024-06-08",
  },
  {
    id: "3",
    name: "Premium Catering Co.",
    type: "vendor",
    path: "/vendors/vnd_789",
    addedAt: "2024-06-05",
  },
  {
    id: "4",
    name: "Event Contract Template",
    type: "document",
    path: "/documents/doc_abc",
    addedAt: "2024-06-01",
  },
  {
    id: "5",
    name: "Monthly Revenue Report",
    type: "report",
    path: "/reports/rpt_def",
    addedAt: "2024-05-28",
  },
  {
    id: "6",
    name: "Tech Conference 2024",
    type: "event",
    path: "/events/evt_ghi",
    addedAt: "2024-05-25",
  },
];

const typeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  event: { icon: Calendar, color: "bg-blue-500", label: "Event" },
  contact: { icon: Users, color: "bg-green-500", label: "Contact" },
  vendor: { icon: Building, color: "bg-purple-500", label: "Vendor" },
  document: { icon: FileText, color: "bg-gray-500", label: "Document" },
  report: { icon: FileText, color: "bg-orange-500", label: "Report" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function FavoritesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Favorites"
        description="Quick access to your starred items"
      />

      <StatGrid columns={4}>
        <StatCard
          title="Total Favorites"
          value={favoriteItems.length}
          icon={Star}
        />
        <StatCard
          title="Events"
          value={favoriteItems.filter((i) => i.type === "event").length}
          valueClassName="text-blue-500"
          icon={Calendar}
        />
        <StatCard
          title="Contacts"
          value={favoriteItems.filter((i) => i.type === "contact").length}
          valueClassName="text-green-500"
          icon={Users}
        />
        <StatCard
          title="Vendors"
          value={favoriteItems.filter((i) => i.type === "vendor").length}
          valueClassName="text-purple-500"
          icon={Building}
        />
      </StatGrid>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search favorites..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Favorites</CardTitle>
          <CardDescription>Items you&apos;ve starred for quick access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {favoriteItems.map((item) => {
              const type = typeConfig[item.type];
              const TypeIcon = type.icon;

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <div className={`p-2 rounded-lg ${type.color}`}>
                      <TypeIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{item.name}</h4>
                        <Badge variant="outline">{type.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Added {formatDate(item.addedAt)}
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
                        <DropdownMenuItem>Copy Link</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Star className="mr-2 h-4 w-4" />
                          Remove from Favorites
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
    </div>
  );
}
