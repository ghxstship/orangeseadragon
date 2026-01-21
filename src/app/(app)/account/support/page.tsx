"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  Ticket,
  BookOpen,
  Activity,
  MessageSquare,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface SupportOption {
  name: string;
  description: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive";
}

const supportOptions: SupportOption[] = [
  {
    name: "Support Tickets",
    description: "Submit and track support requests",
    icon: Ticket,
    href: "/account/support/tickets",
    badge: "2 open",
    badgeVariant: "default",
  },
  {
    name: "Knowledge Base",
    description: "Search help articles and tutorials",
    icon: BookOpen,
    href: "/account/support/knowledge-base",
  },
  {
    name: "System Status",
    description: "Check platform status and incidents",
    icon: Activity,
    href: "/account/support/status",
    badge: "All systems operational",
    badgeVariant: "secondary",
  },
];

interface RecentTicket {
  id: string;
  subject: string;
  status: "open" | "pending" | "resolved";
  priority: "low" | "medium" | "high";
  createdAt: string;
}

const recentTickets: RecentTicket[] = [
  {
    id: "TKT-1234",
    subject: "Unable to export event data",
    status: "open",
    priority: "high",
    createdAt: "2024-06-15",
  },
  {
    id: "TKT-1233",
    subject: "Question about billing cycle",
    status: "pending",
    priority: "medium",
    createdAt: "2024-06-14",
  },
  {
    id: "TKT-1232",
    subject: "Feature request: Calendar sync",
    status: "resolved",
    priority: "low",
    createdAt: "2024-06-10",
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  open: { label: "Open", color: "bg-blue-500", icon: AlertCircle },
  pending: { label: "Pending", color: "bg-yellow-500", icon: Clock },
  resolved: { label: "Resolved", color: "bg-green-500", icon: CheckCircle },
};

export default function AccountSupportPage() {
  const openTickets = recentTickets.filter((t) => t.status === "open").length;
  const pendingTickets = recentTickets.filter((t) => t.status === "pending").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support"
        description="Get help and support for your account"
        actions={
          <Button>
            <MessageSquare className="h-4 w-4 mr-2" />
            New Support Ticket
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Open Tickets"
          value={openTickets}
          valueClassName="text-blue-500"
          icon={Ticket}
        />
        <StatCard
          title="Pending Response"
          value={pendingTickets}
          valueClassName="text-yellow-500"
          icon={Clock}
        />
        <StatCard
          title="Avg Response Time"
          value="2.4 hrs"
          icon={Clock}
        />
        <StatCard
          title="System Status"
          value="Operational"
          valueClassName="text-green-500"
          icon={Activity}
        />
      </StatGrid>

      <div className="grid gap-4 md:grid-cols-3">
        {supportOptions.map((option) => (
          <Link key={option.name} href={option.href}>
            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <option.icon className="h-5 w-5" />
                  {option.name}
                </CardTitle>
                <CardDescription>{option.description}</CardDescription>
              </CardHeader>
              {option.badge && (
                <CardContent className="pt-0">
                  <Badge variant={option.badgeVariant}>{option.badge}</Badge>
                </CardContent>
              )}
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Recent Tickets
          </CardTitle>
          <CardDescription>Your recent support requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTickets.map((ticket) => {
              const status = statusConfig[ticket.status];
              const StatusIcon = status.icon;

              return (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${status.color}`}>
                      <StatusIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-muted-foreground">{ticket.id}</span>
                        <h4 className="font-medium">{ticket.subject}</h4>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${status.color} text-white`}>
                          {status.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Created {ticket.createdAt}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="justify-start h-auto py-4">
              <BookOpen className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Browse Knowledge Base</div>
                <div className="text-xs text-muted-foreground">Find answers to common questions</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4">
              <MessageSquare className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Live Chat</div>
                <div className="text-xs text-muted-foreground">Chat with our support team</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4">
              <Ticket className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Submit a Ticket</div>
                <div className="text-xs text-muted-foreground">Get help from our team</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
