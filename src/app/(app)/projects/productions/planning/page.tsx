"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FolderKanban, Calendar, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PLANNING_PROJECT_STATUS, type PlanningProjectStatus } from "@/lib/enums";

interface PlanningProject {
  id: string;
  name: string;
  plannedStart: string;
  estimatedBudget: string;
  status: PlanningProjectStatus;
}

const planningProjects: PlanningProject[] = [
  { id: "1", name: "Holiday Gala 2024", plannedStart: "Nov 1, 2024", estimatedBudget: "$150,000", status: PLANNING_PROJECT_STATUS.DRAFT },
  { id: "2", name: "Spring Conference", plannedStart: "Mar 15, 2025", estimatedBudget: "$85,000", status: PLANNING_PROJECT_STATUS.REVIEW },
  { id: "3", name: "Product Launch Event", plannedStart: "Feb 1, 2025", estimatedBudget: "$200,000", status: PLANNING_PROJECT_STATUS.DRAFT },
];

export default function ProjectsPlanningPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Planning</h1><p className="text-muted-foreground">Projects in planning phase</p></div>
        <Button><Plus className="h-4 w-4 mr-2" />New Project</Button>
      </div>
      <div className="flex items-center gap-4"><div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search..." className="pl-9" /></div></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FolderKanban className="h-5 w-5" />Projects in Planning</CardTitle><CardDescription>Upcoming projects being planned</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {planningProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2"><h4 className="font-medium">{project.name}</h4><Badge variant="outline">{project.status}</Badge></div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Start: {project.plannedStart}</span>
                    <span>Budget: {project.estimatedBudget}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">Start Project</Button>
                  <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end"><DropdownMenuItem>Edit</DropdownMenuItem><DropdownMenuItem>Duplicate</DropdownMenuItem><DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem></DropdownMenuContent>
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
