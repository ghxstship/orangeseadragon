"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Check,
  CheckCheck,
  Info,
  AlertTriangle,
  AlertCircle,
  X,
  Settings,
  Trash2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUIStore } from "@/stores/ui-store";

type NotificationType = "info" | "success" | "warning" | "error";

interface ApiNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action_url?: string;
  action_label?: string;
}

interface Notification extends Omit<ApiNotification, "timestamp" | "action_url" | "action_label"> {
  timestamp: Date;
  actionUrl?: string;
  actionLabel?: string;
}

const notificationIcons: Record<NotificationType, React.ElementType> = {
  info: Info,
  success: Check,
  warning: AlertTriangle,
  error: AlertCircle,
};

const notificationColors: Record<NotificationType, string> = {
  info: "text-semantic-info bg-semantic-info/10",
  success: "text-semantic-success bg-semantic-success/10",
  warning: "text-semantic-warning bg-semantic-warning/10",
  error: "text-destructive bg-destructive/10",
};

function mapApiNotification(notification: ApiNotification): Notification {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    timestamp: new Date(notification.timestamp),
    read: notification.read,
    actionUrl: notification.action_url,
    actionLabel: notification.action_label,
  };
}

function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const Icon = notificationIcons[notification.type];

  return (
    <div
      className={cn(
        "flex gap-3 p-4 border-b transition-colors",
        !notification.read && "bg-muted/50"
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          notificationColors[notification.type]
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className={cn("text-sm font-medium", !notification.read && "font-semibold")}>
              {notification.title}
            </p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {notification.message}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {!notification.read && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onMarkRead(notification.id)}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(notification.id)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
          </span>
          {notification.actionUrl && (
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              {notification.actionLabel || "View"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function NotificationCenter() {
  const { notificationsPanelOpen, setNotificationsPanelOpen } = useUIStore();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await fetch("/api/v1/notifications");
        if (response.ok) {
          const result = await response.json();
          const data: ApiNotification[] = result.data || [];
          setNotifications(data.map(mapApiNotification));
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const unreadNotifications = notifications.filter((n) => !n.read);
  const readNotifications = notifications.filter((n) => n.read);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <Sheet open={notificationsPanelOpen} onOpenChange={setNotificationsPanelOpen}>
      <SheetContent className="w-full sm:max-w-md p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SheetTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </SheetTitle>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="rounded-full">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <SheetDescription className="sr-only">
            View and manage your notifications
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="all" className="flex flex-col h-[calc(100vh-80px)]">
          <TabsList variant="underline" className="mx-4 mt-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </TabsTrigger>
            <TabsTrigger value="read">Read</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <TabsContent value="all" className="m-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-sm font-medium">No notifications</p>
                  <p className="text-xs text-muted-foreground">
                    You&apos;re all caught up!
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="unread" className="m-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : unreadNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-sm font-medium">All caught up!</p>
                  <p className="text-xs text-muted-foreground">
                    No unread notifications
                  </p>
                </div>
              ) : (
                unreadNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="read" className="m-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : readNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-sm font-medium">No read notifications</p>
                </div>
              ) : (
                readNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))
              )}
            </TabsContent>
          </ScrollArea>

          {notifications.length > 0 && (
            <div className="p-4 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-destructive hover:text-destructive"
                onClick={clearAll}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear all notifications
              </Button>
            </div>
          )}
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
