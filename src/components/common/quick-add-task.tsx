"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { captureError } from '@/lib/observability';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUIStore } from "@/stores/ui-store";
import { useUser } from "@/hooks/use-supabase";
import { CheckSquare, Loader2 } from "lucide-react";

export function QuickAddTask() {
  const router = useRouter();
  const { user } = useUser();
  const { quickAddTaskOpen, setQuickAddTaskOpen } = useUIStore();

  const [title, setTitle] = React.useState("");
  const [priority, setPriority] = React.useState("medium");
  const [dueDate, setDueDate] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Keyboard shortcut: Ctrl/Cmd + Shift + T
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "t") {
        e.preventDefault();
        setQuickAddTaskOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setQuickAddTaskOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const organizationId = user?.user_metadata?.organization_id;
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          priority,
          due_date: dueDate || null,
          status: "todo",
          assignee_id: user?.id || null,
          organization_id: organizationId,
        }),
      });

      if (!response.ok) throw new Error("Failed to create task");

      const result = await response.json();
      setTitle("");
      setPriority("medium");
      setDueDate("");
      setQuickAddTaskOpen(false);

      if (result.data?.id) {
        router.push(`/core/tasks/${result.data.id}`);
      }
    } catch (error) {
      captureError(error, 'quickAddTask.submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setQuickAddTaskOpen(open);
    if (!open) {
      setTitle("");
      setPriority("medium");
      setDueDate("");
    }
  };

  return (
    <Dialog open={quickAddTaskOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px] glass-morphism border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.15em]">
            <CheckSquare className="h-4 w-4" />
            Quick Add Task
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qa-title" className="text-[10px] font-black uppercase tracking-widest opacity-50">
              Title
            </Label>
            <Input
              id="qa-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
              className="border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qa-priority" className="text-[10px] font-black uppercase tracking-widest opacity-50">
                Priority
              </Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qa-due" className="text-[10px] font-black uppercase tracking-widest opacity-50">
                Due Date
              </Label>
              <Input
                id="qa-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="border-border"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              ⌘⇧T to open
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleOpenChange(false)}
                className="text-[10px] font-black uppercase tracking-widest"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!title.trim() || isSubmitting}
                className="text-[10px] font-black uppercase tracking-widest"
              >
                {isSubmitting ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <CheckSquare className="h-3 w-3 mr-1" />
                )}
                Create
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
