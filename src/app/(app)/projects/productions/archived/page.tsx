"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Archive, Calendar, RotateCcw, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const archivedProjects = [
  { id: "1", name: "Winter Gala 2023", archivedDate: "Jan 15, 2024", completedDate: "Dec 20, 2023", status: "completed" },
  { id: "2", name: "Summer Picnic 2023", archivedDate: "Sep 1, 2023", completedDate: "Aug 15, 2023", status: "completed" },
  { id: "3", name: "Cancelled Conference", archivedDate: "Feb 10, 2024", completedDate: "-", status: "cancelled" },
];

export default function ProjectsArchivedPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold tracking-tight">Archived Projects</h1><p className="text-muted-foreground">Past projects stored for reference</p></div>
      <div className="flex items-center gap-4"><div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search archived..." className="pl-9" /></div></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Archive className="h-5 w-5" />Archived Projects</CardTitle><CardDescription>Historical project records</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {archivedProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg opacity-75">
                <div className="flex items-center gap-4">
                  <Archive className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2"><h4 className="font-medium">{project.name}</h4><Badge variant={project.status === "completed" ? "default" : "destructive"}>{project.status}</Badge></div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Archived: {project.archivedDate}</span>
                      {project.completedDate !== "-" && <span>Completed: {project.completedDate}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm"><RotateCcw className="h-3 w-3 mr-2" />Restore</Button>
                  <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end"><DropdownMenuItem>View Details</DropdownMenuItem><DropdownMenuItem>Export</DropdownMenuItem><DropdownMenuItem className="text-destructive">Delete Permanently</DropdownMenuItem></DropdownMenuContent>
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
