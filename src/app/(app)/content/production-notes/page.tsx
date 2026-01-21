"use client";

import * as React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  StickyNote,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  FileText,
  Loader,
} from "lucide-react";

interface ProductionNote {
  id: string;
  title: string;
  content: string;
  eventName: string;
  category: "general" | "technical" | "safety" | "logistics" | "talent" | "urgent";
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "resolved";
  createdBy: string;
  createdAt: string;
  assignedTo?: string;
  comments: number;
}

const productionNotes: ProductionNote[] = [
  {
    id: "1",
    title: "Stage left monitor position needs adjustment",
    content: "The monitor wedge on stage left is too close to the drum riser. Need to move it 2ft downstage.",
    eventName: "Summer Festival 2024",
    category: "technical",
    priority: "medium",
    status: "open",
    createdBy: "Mike Johnson",
    createdAt: "2024-01-15T14:30:00Z",
    assignedTo: "Tom Wilson",
    comments: 3,
  },
  {
    id: "2",
    title: "Emergency exit signage missing in VIP area",
    content: "Section B of VIP area is missing illuminated exit signs. Must be addressed before doors.",
    eventName: "Summer Festival 2024",
    category: "safety",
    priority: "critical",
    status: "in_progress",
    createdBy: "Sarah Chen",
    createdAt: "2024-01-15T10:00:00Z",
    assignedTo: "Emily Watson",
    comments: 5,
  },
  {
    id: "3",
    title: "Catering delivery time confirmed",
    content: "Catering will arrive at 4pm instead of 3pm. Adjusted timeline accordingly.",
    eventName: "Corporate Gala 2024",
    category: "logistics",
    priority: "low",
    status: "resolved",
    createdBy: "Lisa Park",
    createdAt: "2024-01-14T16:00:00Z",
    comments: 1,
  },
  {
    id: "4",
    title: "Headliner requests additional dressing room",
    content: "Artist management has requested a second dressing room for band members. Need to confirm availability.",
    eventName: "Summer Festival 2024",
    category: "talent",
    priority: "high",
    status: "open",
    createdBy: "David Kim",
    createdAt: "2024-01-15T09:00:00Z",
    comments: 2,
  },
  {
    id: "5",
    title: "Power distribution plan update",
    content: "Updated power requirements from lighting vendor. Need additional 200A distro for moving heads.",
    eventName: "Tech Conference 2024",
    category: "technical",
    priority: "high",
    status: "in_progress",
    createdBy: "Tom Wilson",
    createdAt: "2024-01-13T11:00:00Z",
    assignedTo: "Mike Johnson",
    comments: 4,
  },
];

const categoryConfig: Record<string, { label: string; color: string }> = {
  general: { label: "General", color: "bg-gray-500" },
  technical: { label: "Technical", color: "bg-blue-500" },
  safety: { label: "Safety", color: "bg-red-500" },
  logistics: { label: "Logistics", color: "bg-purple-500" },
  talent: { label: "Talent", color: "bg-pink-500" },
  urgent: { label: "Urgent", color: "bg-orange-500" },
};

const priorityConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  low: { label: "Low", color: "text-gray-500", icon: Clock },
  medium: { label: "Medium", color: "text-blue-500", icon: Clock },
  high: { label: "High", color: "text-orange-500", icon: AlertTriangle },
  critical: { label: "Critical", color: "text-red-500", icon: AlertTriangle },
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  open: { label: "Open", color: "bg-yellow-500", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-blue-500", icon: Clock },
  resolved: { label: "Resolved", color: "bg-green-500", icon: CheckCircle },
};

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function ProductionNotesPage() {
  const stats = {
    totalNotes: productionNotes.length,
    open: productionNotes.filter((n) => n.status === "open").length,
    inProgress: productionNotes.filter((n) => n.status === "in_progress").length,
    critical: productionNotes.filter((n) => n.priority === "critical" && n.status !== "resolved").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Production Notes"
        description="Track issues and notes during production"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Note
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Total Notes"
          value={stats.totalNotes}
          icon={FileText}
        />
        <StatCard
          title="Open"
          value={stats.open}
          valueClassName="text-yellow-500"
          icon={Clock}
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          valueClassName="text-blue-500"
          icon={Loader}
        />
        <StatCard
          title="Critical"
          value={stats.critical}
          valueClassName="text-red-500"
          icon={AlertTriangle}
        />
      </StatGrid>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search notes..." className="pl-9" />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="space-y-4">
        {productionNotes.map((note) => {
          const category = categoryConfig[note.category];
          const priority = priorityConfig[note.priority];
          const status = statusConfig[note.status];
          const PriorityIcon = priority.icon;
          const StatusIcon = status.icon;

          return (
            <Card key={note.id} className={`hover:shadow-md transition-shadow ${note.priority === "critical" && note.status !== "resolved" ? "border-red-500" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{getInitials(note.createdBy)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StickyNote className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold">{note.title}</h3>
                        <Badge className={`${category.color} text-white`}>
                          {category.label}
                        </Badge>
                        <Badge className={`${status.color} text-white`}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {status.label}
                        </Badge>
                        <span className={`flex items-center gap-1 text-sm ${priority.color}`}>
                          <PriorityIcon className="h-4 w-4" />
                          {priority.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {note.content}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span>{note.eventName}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatRelativeTime(note.createdAt)}
                        </span>
                        <span>By: {note.createdBy}</span>
                        {note.assignedTo && (
                          <span>Assigned: {note.assignedTo}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {note.comments}
                        </span>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Note</DropdownMenuItem>
                      <DropdownMenuItem>Add Comment</DropdownMenuItem>
                      {note.status === "open" && (
                        <DropdownMenuItem>Mark In Progress</DropdownMenuItem>
                      )}
                      {note.status !== "resolved" && (
                        <DropdownMenuItem className="text-green-600">Mark Resolved</DropdownMenuItem>
                      )}
                      <DropdownMenuItem>Assign To...</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
