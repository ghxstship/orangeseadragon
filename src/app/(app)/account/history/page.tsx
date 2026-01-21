"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  History,
  Activity,
  Settings,
  LogIn,
  Search,
  Download,
  FileEdit,
  Trash2,
  Eye,
  Calendar,
} from "lucide-react";

interface ActivityItem {
  id: string;
  action: string;
  description: string;
  type: "login" | "edit" | "delete" | "view" | "settings";
  timestamp: string;
  ipAddress?: string;
  device?: string;
}

const recentActivity: ActivityItem[] = [
  {
    id: "1",
    action: "Logged in",
    description: "Successful login from Chrome on macOS",
    type: "login",
    timestamp: "2024-06-15 14:32:00",
    ipAddress: "192.168.1.1",
    device: "Chrome / macOS",
  },
  {
    id: "2",
    action: "Updated event",
    description: "Modified 'Summer Festival 2024' event details",
    type: "edit",
    timestamp: "2024-06-15 13:45:00",
  },
  {
    id: "3",
    action: "Viewed report",
    description: "Accessed 'Monthly Revenue Report'",
    type: "view",
    timestamp: "2024-06-15 11:20:00",
  },
  {
    id: "4",
    action: "Changed settings",
    description: "Updated notification preferences",
    type: "settings",
    timestamp: "2024-06-14 16:30:00",
  },
  {
    id: "5",
    action: "Deleted draft",
    description: "Removed draft event 'Test Event'",
    type: "delete",
    timestamp: "2024-06-14 10:15:00",
  },
  {
    id: "6",
    action: "Logged in",
    description: "Successful login from Safari on iOS",
    type: "login",
    timestamp: "2024-06-13 09:00:00",
    ipAddress: "192.168.1.2",
    device: "Safari / iOS",
  },
];

const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  login: { icon: LogIn, color: "bg-green-500" },
  edit: { icon: FileEdit, color: "bg-blue-500" },
  delete: { icon: Trash2, color: "bg-red-500" },
  view: { icon: Eye, color: "bg-purple-500" },
  settings: { icon: Settings, color: "bg-yellow-500" },
};

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function AccountHistoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="History"
        description="Account activity history and audit log"
        actions={
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export History
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Total Activities"
          value="1,234"
          icon={Activity}
        />
        <StatCard
          title="Changes Made"
          value="456"
          icon={Settings}
        />
        <StatCard
          title="Login Sessions"
          value="89"
          icon={LogIn}
        />
        <StatCard
          title="This Month"
          value={recentActivity.length}
          icon={Calendar}
        />
      </StatGrid>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/account/history/activity">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Activity Log
              </CardTitle>
              <CardDescription>All account activities</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/account/history/logins">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogIn className="h-5 w-5 text-green-500" />
                Login History
              </CardTitle>
              <CardDescription>Session and login records</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/account/history/changes">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileEdit className="h-5 w-5 text-purple-500" />
                Change Log
              </CardTitle>
              <CardDescription>Data modifications</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search activity..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Your recent account activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const type = typeConfig[activity.type];
              const TypeIcon = type.icon;

              return (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${type.color}`}>
                      <TypeIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{activity.action}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      {(activity.ipAddress || activity.device) && (
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          {activity.ipAddress && <span>IP: {activity.ipAddress}</span>}
                          {activity.device && <span>• {activity.device}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {formatTimestamp(activity.timestamp)}
                    </p>
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
