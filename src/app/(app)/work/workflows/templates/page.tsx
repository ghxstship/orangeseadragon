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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  FileText,
  Copy,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const workflowTemplates = [
  {
    id: "1",
    name: "Event Approval",
    description: "Standard approval workflow for new events",
    steps: 5,
    category: "Approvals",
    usedCount: 45,
  },
  {
    id: "2",
    name: "Invoice Processing",
    description: "Automated invoice generation and delivery",
    steps: 4,
    category: "Finance",
    usedCount: 32,
  },
  {
    id: "3",
    name: "Onboarding Sequence",
    description: "New customer or team member onboarding",
    steps: 8,
    category: "HR",
    usedCount: 28,
  },
  {
    id: "4",
    name: "Feedback Collection",
    description: "Post-event feedback and survey workflow",
    steps: 3,
    category: "Marketing",
    usedCount: 56,
  },
];

export default function WorkflowTemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflow Templates</h1>
          <p className="text-muted-foreground">
            Pre-built workflow templates
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search templates..." className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">All</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">Approvals</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">Finance</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">HR</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Template Library
          </CardTitle>
          <CardDescription>Ready-to-use workflow templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {workflowTemplates.map((template) => (
              <div key={template.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.description}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Preview</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <Badge variant="outline">{template.category}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {template.steps} steps
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Used {template.usedCount} times
                  </span>
                </div>
                <Button variant="outline" size="sm" className="mt-3">
                  <Copy className="h-3 w-3 mr-2" />
                  Use Template
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
