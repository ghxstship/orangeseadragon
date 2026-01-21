"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Handshake, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const collaborations = [
  { id: "1", title: "Joint Event Partnership", company: "Event Solutions", type: "Partnership", status: "open", postedAt: "Jun 15, 2024" },
  { id: "2", title: "Co-Marketing Campaign", company: "Marketing Pro", type: "Marketing", status: "open", postedAt: "Jun 18, 2024" },
];

export default function OpportunitiesCollaborationsPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold tracking-tight">Collaborations</h1><p className="text-muted-foreground">Partnership opportunities</p></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Handshake className="h-5 w-5" />Available Collaborations</CardTitle><CardDescription>Partnership opportunities</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {collaborations.map((collab) => (
              <div key={collab.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2"><h4 className="font-medium">{collab.title}</h4><Badge variant="outline">{collab.type}</Badge><Badge>{collab.status}</Badge></div>
                  <p className="text-sm text-muted-foreground mt-1">By {collab.company} • Posted {collab.postedAt}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm">Apply</Button>
                  <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end"><DropdownMenuItem>View Details</DropdownMenuItem><DropdownMenuItem>Save</DropdownMenuItem></DropdownMenuContent>
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
