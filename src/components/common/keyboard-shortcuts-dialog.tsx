"use client";

import * as React from "react";
import { Keyboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShortcutEntry {
  keys: string[];
  label: string;
}

interface ShortcutSection {
  title: string;
  shortcuts: ShortcutEntry[];
}

const shortcutSections: ShortcutSection[] = [
  {
    title: "Global",
    shortcuts: [
      { keys: ["⌘", "K"], label: "Open command palette" },
      { keys: ["⌘", "?"], label: "Show keyboard shortcuts" },
      { keys: ["⌘", "/"], label: "Global search" },
      { keys: ["Esc"], label: "Close dialog / deselect" },
    ],
  },
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["⌘", "D"], label: "Go to Dashboard" },
      { keys: ["⌘", "T"], label: "Go to My Tasks" },
      { keys: ["⌘", "I"], label: "Go to Inbox" },
      { keys: ["⌘", "P"], label: "Go to Productions" },
      { keys: ["⌘", ","], label: "Go to Settings" },
      { keys: ["⌘", "⇧", "P"], label: "Go to Profile" },
    ],
  },
  {
    title: "Actions",
    shortcuts: [
      { keys: ["⌘", "N"], label: "Quick add task" },
      { keys: ["⌘", "Enter"], label: "Submit form" },
      { keys: ["⌘", "S"], label: "Save current record" },
      { keys: ["⌘", "⇧", "D"], label: "Duplicate record" },
      { keys: ["⌘", "⌫"], label: "Archive record" },
    ],
  },
  {
    title: "Collection Views",
    shortcuts: [
      { keys: ["⌘", "⇧", "1"], label: "Switch to Table view" },
      { keys: ["⌘", "⇧", "2"], label: "Switch to List view" },
      { keys: ["⌘", "⇧", "3"], label: "Switch to Board view" },
      { keys: ["⌘", "⇧", "4"], label: "Switch to Calendar view" },
      { keys: ["⌘", "A"], label: "Select all records" },
      { keys: ["⌘", "⇧", "F"], label: "Toggle filter panel" },
    ],
  },
  {
    title: "Workspace / Builder",
    shortcuts: [
      { keys: ["⌘", "["], label: "Previous tab" },
      { keys: ["⌘", "]"], label: "Next tab" },
      { keys: ["⌘", "\\"], label: "Toggle sidebar" },
      { keys: ["⌘", "⇧", "E"], label: "Export / Download" },
    ],
  },
];

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  // Also listen for ⌘? to toggle
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "?" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {shortcutSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-3">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.label}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-sm text-muted-foreground">
                      {shortcut.label}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && (
                            <span className="text-[10px] text-muted-foreground">
                              +
                            </span>
                          )}
                          <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                            {key}
                          </kbd>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
