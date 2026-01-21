"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle, Calendar, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const completedProjects = [
  { id: "1", name: "Annual Fundraiser 2024", completedDate: "May 15, 2024", budget: "$120,000", actualSpend: "$115,000", rating: 4.8 },
  { id: "2", name: "Team Building Retreat", completedDate: "Apr 20, 2024", budget: "$45,000", actualSpend: "$42,500", rating: 4.9 },
  { id: "3", name: "Client Appreciation Day", completedDate: "Mar 10, 2024", budget: "$35,000", actualSpend: "$36,200", rating: 4.7 },
];

export default function ProjectsCompletedPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold tracking-tight">Completed Projects</h1><p className="text-muted-foreground">Successfully finished projects</p></div>
      <div className="flex items-center gap-4"><div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search..." className="pl-9" /></div></div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-500">{completedProjects.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Budget</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">$200K</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Avg Rating</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">4.8 ★</div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" />Completed Projects</CardTitle><CardDescription>Project history</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completedProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-4">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <h4 className="font-medium">{project.name}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{project.completedDate}</span>
                      <span>Budget: {project.budget}</span>
                      <span>Spent: {project.actualSpend}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge>{project.rating} ★</Badge>
                  <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end"><DropdownMenuItem>View Report</DropdownMenuItem><DropdownMenuItem>Duplicate</DropdownMenuItem><DropdownMenuItem>Archive</DropdownMenuItem></DropdownMenuContent>
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
