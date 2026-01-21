"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileText, Folder, MoreHorizontal, Download } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const documents = [
  { id: "1", name: "Event Planning Guide.pdf", type: "PDF", size: "2.4 MB", folder: "Templates", updatedAt: "Jun 18, 2024", updatedBy: "Sarah Chen" },
  { id: "2", name: "Vendor Contract Template.docx", type: "Word", size: "156 KB", folder: "Contracts", updatedAt: "Jun 17, 2024", updatedBy: "Mike Johnson" },
  { id: "3", name: "Budget Spreadsheet 2024.xlsx", type: "Excel", size: "1.2 MB", folder: "Finance", updatedAt: "Jun 15, 2024", updatedBy: "Emily Watson" },
  { id: "4", name: "Marketing Assets.zip", type: "Archive", size: "45 MB", folder: "Marketing", updatedAt: "Jun 14, 2024", updatedBy: "David Park" },
  { id: "5", name: "Safety Guidelines.pdf", type: "PDF", size: "890 KB", folder: "Compliance", updatedAt: "Jun 12, 2024", updatedBy: "Lisa Brown" },
];

export default function DocumentsAllPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">All Documents</h1><p className="text-muted-foreground">Browse all files and folders</p></div>
        <Button><Plus className="h-4 w-4 mr-2" />Upload</Button>
      </div>
      <div className="flex items-center gap-4"><div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search documents..." className="pl-9" /></div></div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Files</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{documents.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Folders</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">5</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Size</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">49.6 MB</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Shared</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">12</div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Documents</CardTitle><CardDescription>All files in your workspace</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">{doc.type}</Badge>
                      <span>{doc.size}</span>
                      <span className="flex items-center gap-1"><Folder className="h-3 w-3" />{doc.folder}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm text-muted-foreground"><p>{doc.updatedAt}</p><p>{doc.updatedBy}</p></div>
                  <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                  <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end"><DropdownMenuItem>Preview</DropdownMenuItem><DropdownMenuItem>Share</DropdownMenuItem><DropdownMenuItem>Move</DropdownMenuItem><DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem></DropdownMenuContent>
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
