"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, Users, MoreHorizontal, Download } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const sharedDocuments = [
  { id: "1", name: "Event Planning Guide.pdf", type: "PDF", sharedWith: "Everyone", sharedBy: "Sarah Chen", sharedAt: "Jun 15, 2024" },
  { id: "2", name: "Vendor Contract Template.docx", type: "Word", sharedWith: "Operations Team", sharedBy: "Mike Johnson", sharedAt: "Jun 14, 2024" },
  { id: "3", name: "Budget Spreadsheet 2024.xlsx", type: "Excel", sharedWith: "Finance Team", sharedBy: "Emily Watson", sharedAt: "Jun 12, 2024" },
];

export default function DocumentsSharedPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold tracking-tight">Shared Documents</h1><p className="text-muted-foreground">Files shared with you or by you</p></div>
      <div className="flex items-center gap-4"><div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search shared..." className="pl-9" /></div></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Shared With Me</CardTitle><CardDescription>Documents others have shared</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sharedDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">{doc.type}</Badge>
                      <span>Shared with: {doc.sharedWith}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm text-muted-foreground"><p>By {doc.sharedBy}</p><p>{doc.sharedAt}</p></div>
                  <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                  <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end"><DropdownMenuItem>Open</DropdownMenuItem><DropdownMenuItem>Copy Link</DropdownMenuItem><DropdownMenuItem className="text-destructive">Remove Access</DropdownMenuItem></DropdownMenuContent>
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
