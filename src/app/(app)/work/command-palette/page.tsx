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
  Search,
  Calendar,
  Users,
  FileText,
  DollarSign,
  Building,
  Settings,
  BarChart,
  Plus,
  ArrowRight,
  Keyboard,
} from "lucide-react";

interface Command {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
  shortcut?: string[];
}

const commands: Command[] = [
  {
    id: "1",
    name: "Create Event",
    description: "Start planning a new event",
    icon: Calendar,
    category: "Create",
    shortcut: ["⌘", "E"],
  },
  {
    id: "2",
    name: "Add Contact",
    description: "Add a new contact",
    icon: Users,
    category: "Create",
    shortcut: ["⌘", "⇧", "C"],
  },
  {
    id: "3",
    name: "Create Invoice",
    description: "Generate a new invoice",
    icon: DollarSign,
    category: "Create",
    shortcut: ["⌘", "I"],
  },
  {
    id: "4",
    name: "Add Vendor",
    description: "Register a new vendor",
    icon: Building,
    category: "Create",
  },
  {
    id: "5",
    name: "Go to Dashboard",
    description: "Navigate to dashboard",
    icon: BarChart,
    category: "Navigate",
    shortcut: ["G", "D"],
  },
  {
    id: "6",
    name: "Go to Events",
    description: "View all events",
    icon: Calendar,
    category: "Navigate",
    shortcut: ["G", "E"],
  },
  {
    id: "7",
    name: "Go to Contacts",
    description: "View all contacts",
    icon: Users,
    category: "Navigate",
    shortcut: ["G", "C"],
  },
  {
    id: "8",
    name: "Go to Settings",
    description: "Open settings",
    icon: Settings,
    category: "Navigate",
    shortcut: ["G", "S"],
  },
  {
    id: "9",
    name: "Generate Report",
    description: "Create a custom report",
    icon: FileText,
    category: "Actions",
  },
  {
    id: "10",
    name: "Search Everything",
    description: "Global search",
    icon: Search,
    category: "Actions",
    shortcut: ["⌘", "K"],
  },
];

const categories = ["Create", "Navigate", "Actions"];

export default function CommandPalettePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Command Palette</h1>
          <p className="text-muted-foreground">
            Quick access to all commands and actions
          </p>
        </div>
        <Badge variant="outline" className="font-mono">
          ⌘ + K
        </Badge>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Type a command or search..."
              className="pl-12 h-12 text-lg"
              autoFocus
            />
          </div>
        </CardContent>
      </Card>

      {categories.map((category) => {
        const categoryCommands = commands.filter((c) => c.category === category);

        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {category === "Create" && <Plus className="h-5 w-5" />}
                {category === "Navigate" && <ArrowRight className="h-5 w-5" />}
                {category === "Actions" && <Keyboard className="h-5 w-5" />}
                {category}
              </CardTitle>
              <CardDescription>{categoryCommands.length} commands</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categoryCommands.map((command) => {
                  const Icon = command.icon;

                  return (
                    <Button
                      key={command.id}
                      variant="ghost"
                      className="w-full justify-between h-auto py-3"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <div className="text-left">
                          <p className="font-medium">{command.name}</p>
                          <p className="text-sm text-muted-foreground">{command.description}</p>
                        </div>
                      </div>
                      {command.shortcut && (
                        <div className="flex items-center gap-1">
                          {command.shortcut.map((key, idx) => (
                            <React.Fragment key={idx}>
                              <Badge variant="outline" className="font-mono px-2">
                                {key}
                              </Badge>
                              {idx < command.shortcut!.length - 1 && (
                                <span className="text-muted-foreground text-xs">+</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>• Press <Badge variant="outline" className="font-mono mx-1">⌘ K</Badge> anywhere to open the command palette</p>
          <p>• Start typing to filter commands</p>
          <p>• Use <Badge variant="outline" className="font-mono mx-1">↑</Badge> <Badge variant="outline" className="font-mono mx-1">↓</Badge> to navigate</p>
          <p>• Press <Badge variant="outline" className="font-mono mx-1">Enter</Badge> to execute a command</p>
          <p>• Press <Badge variant="outline" className="font-mono mx-1">Esc</Badge> to close</p>
        </CardContent>
      </Card>
    </div>
  );
}
