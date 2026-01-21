"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { messagesPageConfig } from "@/config/pages/messages";

interface Message {
  id: string;
  subject: string;
  sender: string;
  preview: string;
  timestamp: string;
  read: boolean;
  starred: boolean;
  has_attachment: boolean;
}

export default function MessagesPage() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchMessages() {
      try {
        const response = await fetch("/api/v1/messages");
        if (response.ok) {
          const result = await response.json();
          setMessages(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
  }, []);

  const stats = React.useMemo(() => {
    const unreadCount = messages.filter((m) => !m.read).length;
    const starredCount = messages.filter((m) => m.starred).length;
    const attachmentCount = messages.filter((m) => m.has_attachment).length;

    return [
      { id: "total", label: "Total Messages", value: messages.length },
      { id: "unread", label: "Unread", value: unreadCount },
      { id: "starred", label: "Starred", value: starredCount },
      { id: "attachments", label: "With Attachments", value: attachmentCount },
    ];
  }, [messages]);

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
    <DataViewPage<Message>
      config={messagesPageConfig}
      data={messages}
      stats={stats}
      getRowId={(m) => m.id}
      searchFields={["subject", "sender", "preview"]}
      onAction={handleAction}
    />
  );
}
