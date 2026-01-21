"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileText, Copy, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const templates = [
  { id: "1", name: "Event Proposal Template", category: "Events", usedCount: 45, lastUsed: "Jun 18, 2024" },
  { id: "2", name: "Vendor Contract", category: "Contracts", usedCount: 32, lastUsed: "Jun 17, 2024" },
  { id: "3", name: "Budget Template", category: "Finance", usedCount: 28, lastUsed: "Jun 15, 2024" },
  { id: "4", name: "Meeting Minutes", category: "General", usedCount: 56, lastUsed: "Jun 19, 2024" },
  { id: "5", name: "Project Brief", category: "Projects", usedCount: 23, lastUsed: "Jun 14, 2024" },
];

export default function DocumentsTemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Document Templates</h1><p className="text-muted-foreground">Reusable document templates</p></div>
        <Button><Plus className="h-4 w-4 mr-2" />Create Template</Button>
      </div>
      <div className="flex items-center gap-4"><div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search templates..." className="pl-9" /></div></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Template Library</CardTitle><CardDescription>Ready-to-use document templates</CardDescription></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((template) => (
              <div key={template.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div><h4 className="font-medium">{template.name}</h4><Badge variant="outline" className="mt-1">{template.category}</Badge></div>
                  <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end"><DropdownMenuItem>Preview</DropdownMenuItem><DropdownMenuItem>Edit</DropdownMenuItem><DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem></DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>Used {template.usedCount} times</span>
                  <span>Last: {template.lastUsed}</span>
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
