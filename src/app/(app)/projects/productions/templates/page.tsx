"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileText, Copy, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const projectTemplates = [
  { id: "1", name: "Corporate Event", description: "Standard corporate event template", tasks: 25, phases: 4, usedCount: 18 },
  { id: "2", name: "Music Festival", description: "Large-scale festival planning", tasks: 45, phases: 6, usedCount: 8 },
  { id: "3", name: "Wedding", description: "Complete wedding planning template", tasks: 35, phases: 5, usedCount: 24 },
  { id: "4", name: "Conference", description: "Multi-day conference template", tasks: 30, phases: 4, usedCount: 12 },
];

export default function ProjectsTemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Project Templates</h1><p className="text-muted-foreground">Reusable project structures</p></div>
        <Button><Plus className="h-4 w-4 mr-2" />Create Template</Button>
      </div>
      <div className="flex items-center gap-4"><div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search templates..." className="pl-9" /></div></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Template Library</CardTitle><CardDescription>Start projects from templates</CardDescription></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {projectTemplates.map((template) => (
              <div key={template.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div><h4 className="font-medium">{template.name}</h4><p className="text-sm text-muted-foreground mt-1">{template.description}</p></div>
                  <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end"><DropdownMenuItem>Preview</DropdownMenuItem><DropdownMenuItem>Edit</DropdownMenuItem><DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem></DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <Badge variant="outline">{template.tasks} tasks</Badge>
                  <span>{template.phases} phases</span>
                  <span>Used {template.usedCount} times</span>
                </div>
                <Button variant="outline" size="sm" className="mt-3"><Copy className="h-3 w-3 mr-2" />Use Template</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
