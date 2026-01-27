"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Keyboard,
  Search,
  Plus,
  Copy,
} from "lucide-react";

interface Shortcut {
  id: string;
  action: string;
  keys: string[];
  category: string;
  description: string;
}

const shortcuts: Shortcut[] = [
  {
    id: "1",
    action: "Global Search",
    keys: ["⌘", "K"],
    category: "Navigation",
    description: "Open the global search dialog",
  },
  {
    id: "2",
    action: "Create New",
    keys: ["⌘", "N"],
    category: "Actions",
    description: "Create a new item in the current context",
  },
  {
    id: "3",
    action: "Save",
    keys: ["⌘", "S"],
    category: "Actions",
    description: "Save the current item",
  },
  {
    id: "4",
    action: "Undo",
    keys: ["⌘", "Z"],
    category: "Editing",
    description: "Undo the last action",
  },
  {
    id: "5",
    action: "Redo",
    keys: ["⌘", "⇧", "Z"],
    category: "Editing",
    description: "Redo the last undone action",
  },
  {
    id: "6",
    action: "Copy",
    keys: ["⌘", "C"],
    category: "Editing",
    description: "Copy selected item",
  },
  {
    id: "7",
    action: "Delete",
    keys: ["⌘", "⌫"],
    category: "Actions",
    description: "Delete selected item",
  },
  {
    id: "8",
    action: "Go to Dashboard",
    keys: ["G", "D"],
    category: "Navigation",
    description: "Navigate to the dashboard",
  },
  {
    id: "9",
    action: "Go to Events",
    keys: ["G", "E"],
    category: "Navigation",
    description: "Navigate to events list",
  },
  {
    id: "10",
    action: "Go to Contacts",
    keys: ["G", "C"],
    category: "Navigation",
    description: "Navigate to contacts list",
  },
  {
    id: "11",
    action: "Previous Item",
    keys: ["K"],
    category: "Navigation",
    description: "Move to previous item in list",
  },
  {
    id: "12",
    action: "Next Item",
    keys: ["J"],
    category: "Navigation",
    description: "Move to next item in list",
  },
  {
    id: "13",
    action: "Open Item",
    keys: ["Enter"],
    category: "Actions",
    description: "Open the selected item",
  },
  {
    id: "14",
    action: "Close Modal",
    keys: ["Esc"],
    category: "Navigation",
    description: "Close the current modal or dialog",
  },
  {
    id: "15",
    action: "Toggle Sidebar",
    keys: ["⌘", "B"],
    category: "Navigation",
    description: "Show or hide the sidebar",
  },
];

const categories = ["Navigation", "Actions", "Editing"];

const categoryIcons: Record<string, React.ElementType> = {
  Navigation: Search,
  Actions: Plus,
  Editing: Copy,
};

export default function ShortcutsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Keyboard Shortcuts</h1>
          <p className="text-muted-foreground">
            Speed up your workflow with keyboard shortcuts
          </p>
        </div>
        <Keyboard className="h-8 w-8 text-muted-foreground" />
      </div>

      <div className="grid gap-6">
        {categories.map((category) => {
          const categoryShortcuts = shortcuts.filter((s) => s.category === category);
          const Icon = categoryIcons[category];

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {category}
                </CardTitle>
                <CardDescription>{categoryShortcuts.length} shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {categoryShortcuts.map((shortcut) => (
                    <div
                      key={shortcut.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{shortcut.action}</p>
                        <p className="text-sm text-muted-foreground">{shortcut.description}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, idx) => (
                          <React.Fragment key={idx}>
                            <Badge variant="outline" className="font-mono px-2">
                              {key}
                            </Badge>
                            {idx < shortcut.keys.length - 1 && (
                              <span className="text-muted-foreground">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>• Press <Badge variant="outline" className="font-mono mx-1">?</Badge> anywhere to show this shortcuts reference</p>
          <p>• Use <Badge variant="outline" className="font-mono mx-1">G</Badge> followed by a letter for quick navigation</p>
          <p>• Most shortcuts work when no input field is focused</p>
          <p>• On Windows/Linux, use <Badge variant="outline" className="font-mono mx-1">Ctrl</Badge> instead of <Badge variant="outline" className="font-mono mx-1">⌘</Badge></p>
        </CardContent>
      </Card>
    </div>
  );
}
