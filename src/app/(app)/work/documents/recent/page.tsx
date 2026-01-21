"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Clock, MoreHorizontal, Download } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const recentDocuments = [
  { id: "1", name: "Event Planning Guide.pdf", type: "PDF", size: "2.4 MB", accessedAt: "2 hours ago", action: "Viewed" },
  { id: "2", name: "Vendor Contract Template.docx", type: "Word", size: "156 KB", accessedAt: "4 hours ago", action: "Edited" },
  { id: "3", name: "Budget Spreadsheet 2024.xlsx", type: "Excel", size: "1.2 MB", accessedAt: "Yesterday", action: "Downloaded" },
  { id: "4", name: "Marketing Assets.zip", type: "Archive", size: "45 MB", accessedAt: "2 days ago", action: "Uploaded" },
];

export default function DocumentsRecentPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold tracking-tight">Recent Documents</h1><p className="text-muted-foreground">Files you have accessed recently</p></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Recently Accessed</CardTitle><CardDescription>Your recent file activity</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">{doc.type}</Badge>
                      <span>{doc.size}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm text-muted-foreground"><p>{doc.accessedAt}</p><p>{doc.action}</p></div>
                  <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                  <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end"><DropdownMenuItem>Open</DropdownMenuItem><DropdownMenuItem>Share</DropdownMenuItem><DropdownMenuItem className="text-destructive">Remove from Recent</DropdownMenuItem></DropdownMenuContent>
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
