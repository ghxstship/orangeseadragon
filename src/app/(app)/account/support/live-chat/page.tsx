"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/common";
import {
  Send,
  Paperclip,
  User,
  Bot,
  Clock,
  CheckCircle,
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "agent" | "bot";
  senderName: string;
  content: string;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
}

const messages: Message[] = [
  {
    id: "1",
    sender: "bot",
    senderName: "ATLVS Bot",
    content: "Hello! Welcome to ATLVS support. How can I help you today?",
    timestamp: "2024-06-15T14:00:00",
  },
  {
    id: "2",
    sender: "user",
    senderName: "You",
    content: "Hi, I'm having trouble exporting my financial reports to PDF.",
    timestamp: "2024-06-15T14:01:00",
    status: "read",
  },
  {
    id: "3",
    sender: "bot",
    senderName: "ATLVS Bot",
    content: "I understand you're having issues with PDF exports. Let me connect you with a support agent who can help with this.",
    timestamp: "2024-06-15T14:01:30",
  },
  {
    id: "4",
    sender: "agent",
    senderName: "Sarah (Support)",
    content: "Hi there! I'm Sarah from the support team. I'd be happy to help you with the PDF export issue. Can you tell me which browser you're using and what error message you're seeing?",
    timestamp: "2024-06-15T14:02:00",
  },
  {
    id: "5",
    sender: "user",
    senderName: "You",
    content: "I'm using Chrome and getting a 'Generation Failed' error when I click the export button.",
    timestamp: "2024-06-15T14:03:00",
    status: "read",
  },
  {
    id: "6",
    sender: "agent",
    senderName: "Sarah (Support)",
    content: "Thank you for that information. This is a known issue we're currently working on. As a workaround, you can try clearing your browser cache or using the 'Export to Excel' option and then converting to PDF. Would you like me to walk you through either of these options?",
    timestamp: "2024-06-15T14:04:00",
  },
];

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LiveChatPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Chat"
        description="Chat with our support team in real-time"
        actions={
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="mr-1 h-3 w-3" />
            Connected
          </Badge>
        }
      />

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-3">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                    S
                  </div>
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                </div>
                <div>
                  <CardTitle className="text-base">Sarah (Support)</CardTitle>
                  <p className="text-sm text-muted-foreground">Online • Typically replies in minutes</p>
                </div>
              </div>
              <Badge variant="outline">Ticket #TKT-001</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[400px] overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] ${message.sender === "user" ? "order-2" : ""}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {message.sender !== "user" && (
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-white text-xs ${message.sender === "bot" ? "bg-purple-500" : "bg-blue-500"}`}>
                          {message.sender === "bot" ? <Bot className="h-4 w-4" /> : message.senderName[0]}
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">{message.senderName}</span>
                      <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
                    </div>
                    <div className={`p-3 rounded-lg ${message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                    {message.status && (
                      <p className="text-xs text-muted-foreground mt-1 text-right">
                        {message.status === "read" ? "Read" : message.status === "delivered" ? "Delivered" : "Sent"}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t p-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input placeholder="Type your message..." className="flex-1" />
                <Button>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Chat Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Started</span>
                <span>2:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span>4 minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span>Technical</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Priority</span>
                <Badge variant="outline">Medium</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Responses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                Yes, that would be helpful
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                Can you explain more?
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                That solved my issue!
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                I need more help
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Wait Times
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current</span>
                <span className="text-green-500 font-medium">&lt; 1 min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average</span>
                <span>3 mins</span>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">5 agents online</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
