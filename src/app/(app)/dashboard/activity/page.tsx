"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Calendar,
  Users,
  FileText,
  CheckSquare,
  DollarSign,
  Settings,
  MessageSquare,
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: "event" | "task" | "document" | "payment" | "user" | "settings" | "message";
  action: string;
  description: string;
  user: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

const activities: ActivityItem[] = [
  {
    id: "1",
    type: "event",
    action: "Event Created",
    description: "Summer Music Festival 2024 was created",
    user: "Sarah Chen",
    timestamp: "2024-06-15T14:30:00",
  },
  {
    id: "2",
    type: "task",
    action: "Task Completed",
    description: "Vendor contracts review marked as complete",
    user: "Mike Johnson",
    timestamp: "2024-06-15T13:15:00",
  },
  {
    id: "3",
    type: "payment",
    action: "Payment Received",
    description: "Invoice INV-2024-0156 paid - $15,000",
    user: "System",
    timestamp: "2024-06-15T11:00:00",
  },
  {
    id: "4",
    type: "user",
    action: "Team Member Added",
    description: "Emily Watson joined the organization",
    user: "Admin",
    timestamp: "2024-06-14T16:45:00",
  },
  {
    id: "5",
    type: "document",
    action: "Document Uploaded",
    description: "Venue floor plan uploaded to Summer Festival project",
    user: "David Park",
    timestamp: "2024-06-14T14:20:00",
  },
  {
    id: "6",
    type: "message",
    action: "Comment Added",
    description: "New comment on Corporate Conference planning",
    user: "Lisa Brown",
    timestamp: "2024-06-14T10:30:00",
  },
  {
    id: "7",
    type: "settings",
    action: "Settings Updated",
    description: "Organization billing settings updated",
    user: "Sarah Chen",
    timestamp: "2024-06-13T09:00:00",
  },
];

const iconMap = {
  event: Calendar,
  task: CheckSquare,
  document: FileText,
  payment: DollarSign,
  user: Users,
  settings: Settings,
  message: MessageSquare,
};

const colorMap = {
  event: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
  task: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
  document: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400",
  payment: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400",
  user: "bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-400",
  settings: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  message: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400",
};

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

export default function DashboardActivityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity</h1>
        <p className="text-muted-foreground">
          Recent activity across your workspace
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search activity..." className="pl-9" />
        </div>
        <div className="flex gap-2">
          {Object.keys(iconMap).map((type) => (
            <Badge key={type} variant="outline" className="cursor-pointer hover:bg-muted">
              {type}
            </Badge>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
          <CardDescription>All recent actions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-6">
              {activities.map((activity) => {
                const Icon = iconMap[activity.type];
                const colorClass = colorMap[activity.type];

                return (
                  <div key={activity.id} className="relative flex gap-4 pl-12">
                    <div className={`absolute left-0 p-2 rounded-full ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTime(activity.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">by {activity.user}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
