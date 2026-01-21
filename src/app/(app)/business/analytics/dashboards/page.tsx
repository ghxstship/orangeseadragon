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
  Plus,
  MoreHorizontal,
  LayoutDashboard,
  Star,
  Users,
  Eye,
} from "lucide-react";

interface Dashboard {
  id: string;
  name: string;
  description: string;
  owner: string;
  widgets: number;
  views: number;
  lastModified: string;
  shared: boolean;
  starred: boolean;
}

const dashboards: Dashboard[] = [
  {
    id: "1",
    name: "Executive Overview",
    description: "High-level KPIs and metrics for leadership",
    owner: "Sarah Chen",
    widgets: 12,
    views: 1250,
    lastModified: "2024-06-15",
    shared: true,
    starred: true,
  },
  {
    id: "2",
    name: "Operations Dashboard",
    description: "Real-time operational metrics and alerts",
    owner: "Mike Johnson",
    widgets: 18,
    views: 890,
    lastModified: "2024-06-14",
    shared: true,
    starred: true,
  },
  {
    id: "3",
    name: "Financial Performance",
    description: "Revenue, costs, and profitability analysis",
    owner: "Emily Watson",
    widgets: 15,
    views: 567,
    lastModified: "2024-06-13",
    shared: false,
    starred: false,
  },
  {
    id: "4",
    name: "Marketing Analytics",
    description: "Campaign performance and ROI tracking",
    owner: "David Park",
    widgets: 10,
    views: 345,
    lastModified: "2024-06-12",
    shared: true,
    starred: false,
  },
  {
    id: "5",
    name: "Customer Insights",
    description: "Customer behavior and satisfaction metrics",
    owner: "Lisa Brown",
    widgets: 8,
    views: 234,
    lastModified: "2024-06-10",
    shared: false,
    starred: false,
  },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function DashboardsPage() {
  const sharedCount = dashboards.filter((d) => d.shared).length;
  const starredCount = dashboards.filter((d) => d.starred).length;
  const totalViews = dashboards.reduce((acc, d) => acc + d.views, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboards"
        description="Create and manage custom dashboards"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Dashboard
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Total Dashboards"
          value={dashboards.length}
          icon={LayoutDashboard}
        />
        <StatCard
          title="Shared"
          value={sharedCount}
          valueClassName="text-blue-500"
          icon={Users}
        />
        <StatCard
          title="Starred"
          value={starredCount}
          valueClassName="text-yellow-500"
          icon={Star}
        />
        <StatCard
          title="Total Views"
          value={totalViews.toLocaleString()}
          icon={Eye}
        />
      </StatGrid>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search dashboards..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5" />
            All Dashboards
          </CardTitle>
          <CardDescription>Your custom dashboards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {dashboards.map((dashboard) => (
              <div key={dashboard.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {dashboard.starred && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                      <h4 className="font-medium">{dashboard.name}</h4>
                      {dashboard.shared && (
                        <Badge variant="outline">
                          <Users className="mr-1 h-3 w-3" />
                          Shared
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{dashboard.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{dashboard.widgets} widgets</span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {dashboard.views.toLocaleString()} views
                      </span>
                      <span>Modified {formatDate(dashboard.lastModified)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Owner: {dashboard.owner}</p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Open</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem>{dashboard.starred ? "Unstar" : "Star"}</DropdownMenuItem>
                      <DropdownMenuItem>{dashboard.shared ? "Unshare" : "Share"}</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
