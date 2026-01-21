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
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  Search,
  MessageCircle,
  Send,
  Users,
  Mail,
  CheckCircle,
} from "lucide-react";

interface Conversation {
  id: string;
  name: string;
  type: "direct" | "group";
  lastMessage: string;
  timestamp: string;
  unread: number;
  online?: boolean;
  participants?: number;
}

const conversations: Conversation[] = [
  {
    id: "1",
    name: "Sarah Chen",
    type: "direct",
    lastMessage: "Sounds good, let's proceed with that plan",
    timestamp: "2024-06-15T15:30:00",
    unread: 2,
    online: true,
  },
  {
    id: "2",
    name: "Event Planning Team",
    type: "group",
    lastMessage: "Mike: I've updated the schedule",
    timestamp: "2024-06-15T14:45:00",
    unread: 5,
    participants: 8,
  },
  {
    id: "3",
    name: "Mike Johnson",
    type: "direct",
    lastMessage: "The equipment is ready for pickup",
    timestamp: "2024-06-15T12:00:00",
    unread: 0,
    online: false,
  },
  {
    id: "4",
    name: "Vendor Coordination",
    type: "group",
    lastMessage: "Emily: Contract signed and sent",
    timestamp: "2024-06-14T16:30:00",
    unread: 0,
    participants: 12,
  },
  {
    id: "5",
    name: "Emily Watson",
    type: "direct",
    lastMessage: "Thanks for the update!",
    timestamp: "2024-06-14T10:00:00",
    unread: 0,
    online: true,
  },
];

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}

export default function ChatPage() {
  const totalUnread = conversations.reduce((acc, c) => acc + c.unread, 0);
  const onlineCount = conversations.filter((c) => c.type === "direct" && c.online).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chat"
        description="Real-time messaging"
        actions={
          <Button>
            <MessageCircle className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Conversations"
          value={conversations.length}
          icon={MessageCircle}
        />
        <StatCard
          title="Unread"
          value={totalUnread}
          valueClassName="text-blue-500"
          icon={Mail}
        />
        <StatCard
          title="Online"
          value={onlineCount}
          valueClassName="text-green-500"
          icon={CheckCircle}
        />
        <StatCard
          title="Groups"
          value={conversations.filter((c) => c.type === "group").length}
          icon={Users}
        />
      </StatGrid>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversations
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-9" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${conversation.unread > 0 ? "bg-blue-50 dark:bg-blue-950/20" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${conversation.type === "group" ? "bg-purple-500" : "bg-blue-500"}`}>
                          {conversation.type === "group" ? (
                            <Users className="h-5 w-5 text-white" />
                          ) : (
                            <span className="text-white font-medium">{conversation.name[0]}</span>
                          )}
                        </div>
                        {conversation.type === "direct" && conversation.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{conversation.name}</span>
                          {conversation.unread > 0 && (
                            <Badge className="bg-blue-500 text-white text-xs">{conversation.unread}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{conversation.lastMessage}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatTime(conversation.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sarah Chen</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Online
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-4 h-[300px] overflow-y-auto">
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                  <p className="text-sm">Hey, how&apos;s the event setup going?</p>
                  <span className="text-xs text-muted-foreground">3:15 PM</span>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[80%]">
                  <p className="text-sm">Going great! We&apos;re on schedule.</p>
                  <span className="text-xs opacity-70">3:20 PM</span>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                  <p className="text-sm">Sounds good, let&apos;s proceed with that plan</p>
                  <span className="text-xs text-muted-foreground">3:30 PM</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Input placeholder="Type a message..." className="flex-1" />
              <Button>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
