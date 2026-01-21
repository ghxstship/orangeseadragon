"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { notificationsPageConfig } from "@/config/pages/notifications";

interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  category: "task" | "event" | "message" | "document" | "team" | "finance" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action_url?: string;
  actor?: {
    name: string;
    avatar?: string;
  };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await fetch("/api/v1/notifications");
        if (response.ok) {
          const result = await response.json();
          setNotifications(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  const stats = React.useMemo(() => {
    const unreadCount = notifications.filter((n) => !n.read).length;
    const todayCount = notifications.filter((n) => {
      const date = new Date(n.timestamp);
      const today = new Date();
      return date.toDateString() === today.toDateString();
    }).length;
    const warningCount = notifications.filter((n) => n.type === "warning" || n.type === "error").length;

    return [
      { id: "unread", label: "Unread", value: unreadCount },
      { id: "today", label: "Today", value: todayCount },
      { id: "total", label: "This Week", value: notifications.length },
      { id: "warnings", label: "Warnings", value: warningCount },
    ];
  }, [notifications]);

  const handleAction = React.useCallback((actionId: string, payload?: unknown) => {
    console.log("Action:", actionId, payload);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DataViewPage<Notification>
      config={notificationsPageConfig}
      data={notifications}
      stats={stats}
      getRowId={(n) => n.id}
      searchFields={["title", "message"]}
      onAction={handleAction}
    />
  );
}
