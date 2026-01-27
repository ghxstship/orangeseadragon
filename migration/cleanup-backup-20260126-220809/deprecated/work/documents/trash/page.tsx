"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, RotateCcw, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const trashedDocuments = [
  { id: "1", name: "Old Budget 2023.xlsx", type: "Excel", deletedAt: "Jun 15, 2024", deletedBy: "Sarah Chen", expiresIn: "15 days" },
  { id: "2", name: "Draft Proposal v1.docx", type: "Word", deletedAt: "Jun 12, 2024", deletedBy: "Mike Johnson", expiresIn: "12 days" },
  { id: "3", name: "Unused Template.pdf", type: "PDF", deletedAt: "Jun 10, 2024", deletedBy: "Emily Watson", expiresIn: "10 days" },
];

export default function DocumentsTrashPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Trash</h1><p className="text-muted-foreground">Deleted files (auto-deleted after 30 days)</p></div>
        <Button variant="destructive"><Trash2 className="h-4 w-4 mr-2" />Empty Trash</Button>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Trash2 className="h-5 w-5" />Deleted Files</CardTitle><CardDescription>Files pending permanent deletion</CardDescription></CardHeader>
        <CardContent>
          {trashedDocuments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Trash is empty</p>
          ) : (
            <div className="space-y-2">
              {trashedDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline">{doc.type}</Badge>
                        <span>Deleted: {doc.deletedAt}</span>
                        <span>Expires in {doc.expiresIn}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm"><RotateCcw className="h-3 w-3 mr-2" />Restore</Button>
                    <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end"><DropdownMenuItem>View Details</DropdownMenuItem><DropdownMenuItem className="text-destructive">Delete Permanently</DropdownMenuItem></DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
