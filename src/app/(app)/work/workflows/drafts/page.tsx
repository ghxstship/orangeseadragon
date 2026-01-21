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
  FileEdit,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const draftWorkflows = [
  {
    id: "1",
    name: "Customer Onboarding",
    description: "Automated onboarding sequence for new customers",
    steps: 8,
    lastEdited: "2 hours ago",
    createdBy: "Sarah Chen",
  },
  {
    id: "2",
    name: "Feedback Collection",
    description: "Post-event feedback collection workflow",
    steps: 5,
    lastEdited: "Yesterday",
    createdBy: "Mike Johnson",
  },
  {
    id: "3",
    name: "Resource Allocation",
    description: "Auto-allocate resources based on event requirements",
    steps: 12,
    lastEdited: "3 days ago",
    createdBy: "Emily Watson",
  },
];

export default function WorkflowDraftsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflow Drafts</h1>
          <p className="text-muted-foreground">
            Workflows in progress
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Draft
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search drafts..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileEdit className="h-5 w-5" />
            Draft Workflows
          </CardTitle>
          <CardDescription>Workflows being developed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {draftWorkflows.map((workflow) => (
              <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{workflow.name}</h4>
                    <Badge variant="outline">Draft</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {workflow.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>{workflow.steps} steps</span>
                    <span>Last edited: {workflow.lastEdited}</span>
                    <span>By: {workflow.createdBy}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Continue Editing
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Preview</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem>Publish</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
