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
  Calendar,
  Pin,
  Tag,
  Folder,
  FileText,
  ListTodo,
  Layers,
  Loader2,
} from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  category: "general" | "meeting" | "idea" | "task" | "reference";
  event_name?: string;
  project_name?: string;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
  tags: string[];
  created_by: string;
}

const categoryConfig: Record<string, { label: string; color: string }> = {
  general: { label: "General", color: "bg-gray-500" },
  meeting: { label: "Meeting", color: "bg-blue-500" },
  idea: { label: "Idea", color: "bg-purple-500" },
  task: { label: "Task", color: "bg-orange-500" },
  reference: { label: "Reference", color: "bg-green-500" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}


export default function NotesPage() {
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchNotes() {
      try {
        const response = await fetch("/api/v1/work/notes");
        if (response.ok) {
          const result = await response.json();
          setNotes(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch notes:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchNotes();
  }, []);

  const totalNotes = notes.length;
  const pinnedNotes = notes.filter((n) => n.is_pinned).length;
  const taskNotes = notes.filter((n) => n.category === "task").length;

  const stats = {
    totalNotes,
    pinnedNotes,
    taskNotes,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notes"
        description="Quick notes and reminders"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Note
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
          title="Pinned"
          value={stats.pinnedNotes}
          valueClassName="text-yellow-500"
          icon={Pin}
        />
        <StatCard
          title="Tasks"
          value={stats.taskNotes}
          valueClassName="text-orange-500"
          icon={ListTodo}
        />
        <StatCard
          title="Categories"
          value={Object.keys(categoryConfig).length}
          icon={Layers}
        />
      </StatGrid>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search notes..." className="pl-9" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => {
          const category = categoryConfig[note.category];

          return (
            <Card key={note.id} className={`hover:shadow-md transition-shadow ${note.is_pinned ? "border-yellow-500" : ""}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {note.is_pinned && (
                      <Pin className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                    <Badge className={`${category.color} text-white`}>
                      {category.label}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit Note</DropdownMenuItem>
                      <DropdownMenuItem>
                        {note.is_pinned ? "Unpin" : "Pin to Top"}
                      </DropdownMenuItem>
                      <DropdownMenuItem>Share</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="text-base mt-2">{note.title}</CardTitle>
                {(note.event_name || note.project_name) && (
                  <CardDescription className="flex items-center gap-1">
                    <Folder className="h-3 w-3" />
                    {note.event_name || note.project_name}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-4">
                  {note.content}
                </p>

                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {note.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        <Tag className="mr-1 h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-3 border-t text-xs text-muted-foreground">
                  <span>{note.created_by}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(note.updated_at)}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
