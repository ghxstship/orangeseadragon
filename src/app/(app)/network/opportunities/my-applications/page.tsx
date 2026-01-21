"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const applications = [
  { id: "1", position: "Event Manager", company: "Events Pro", appliedAt: "Jun 15, 2024", status: "under_review" },
  { id: "2", position: "Sound Technician", company: "Audio Masters", appliedAt: "Jun 10, 2024", status: "interview" },
  { id: "3", position: "Marketing Coordinator", company: "Marketing Co", appliedAt: "Jun 5, 2024", status: "rejected" },
];

export default function OpportunitiesMyApplicationsPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold tracking-tight">My Applications</h1><p className="text-muted-foreground">Track your job applications</p></div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{applications.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-500">{applications.filter(a => a.status !== "rejected").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Interviews</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-500">{applications.filter(a => a.status === "interview").length}</div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Applications</CardTitle><CardDescription>Your submitted applications</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2"><h4 className="font-medium">{app.position}</h4><Badge variant={app.status === "interview" ? "default" : app.status === "rejected" ? "destructive" : "secondary"}>{app.status.replace("_", " ")}</Badge></div>
                  <p className="text-sm text-muted-foreground">{app.company}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Calendar className="h-3 w-3" />Applied: {app.appliedAt}</p>
                </div>
                <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end"><DropdownMenuItem>View Details</DropdownMenuItem><DropdownMenuItem>Withdraw</DropdownMenuItem></DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
