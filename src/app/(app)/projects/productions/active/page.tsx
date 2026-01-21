"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Search, Plus, FolderKanban, Calendar, Users, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const projects = [
  { id: "1", name: "Summer Music Festival", status: "active", progress: 65, dueDate: "Jul 15, 2024", team: 8, tasks: { completed: 24, total: 37 } },
  { id: "2", name: "Corporate Conference 2024", status: "active", progress: 45, dueDate: "Sep 20, 2024", team: 5, tasks: { completed: 12, total: 28 } },
  { id: "3", name: "Wedding Expo", status: "active", progress: 80, dueDate: "Jun 25, 2024", team: 6, tasks: { completed: 32, total: 40 } },
  { id: "4", name: "Tech Summit", status: "active", progress: 30, dueDate: "Oct 10, 2024", team: 4, tasks: { completed: 8, total: 25 } },
];

export default function ProjectsActivePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Active Projects</h1><p className="text-muted-foreground">Projects currently in progress</p></div>
        <Button><Plus className="h-4 w-4 mr-2" />New Project</Button>
      </div>
      <div className="flex items-center gap-4"><div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search projects..." className="pl-9" /></div></div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{projects.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{projects.reduce((s, p) => s + p.tasks.total, 0)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-500">{projects.reduce((s, p) => s + p.tasks.completed, 0)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Team Members</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{projects.reduce((s, p) => s + p.team, 0)}</div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FolderKanban className="h-5 w-5" />Projects</CardTitle><CardDescription>All active projects</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2"><h4 className="font-medium">{project.name}</h4><Badge>Active</Badge></div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{project.dueDate}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{project.team} members</span>
                      <span>{project.tasks.completed}/{project.tasks.total} tasks</span>
                    </div>
                  </div>
                  <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end"><DropdownMenuItem>View Details</DropdownMenuItem><DropdownMenuItem>Edit</DropdownMenuItem><DropdownMenuItem>Archive</DropdownMenuItem></DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-3"><div className="flex justify-between text-sm mb-1"><span>Progress</span><span>{project.progress}%</span></div><Progress value={project.progress} /></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
