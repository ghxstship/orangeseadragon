"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { FileText, Download, Share2, Clock, Loader2 } from "lucide-react";
import { EntityDetailPage } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Document {
  id: string;
  name: string;
  file_type?: string;
  file_size?: string;
  status: string;
  folder?: string;
  created_at?: string;
  updated_at?: string;
  owner?: { id: string; name: string };
  metadata?: Record<string, unknown>;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  draft: { label: "Draft", variant: "secondary" },
  published: { label: "Published", variant: "default" },
  archived: { label: "Archived", variant: "outline" },
};

export default function DocumentDetailPage() {
  const params = useParams();
  const documentId = params.id as string;
  const [doc, setDoc] = React.useState<Document | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchDocument() {
      try {
        const response = await fetch(`/api/v1/documents/${documentId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch document");
        }
        const result = await response.json();
        setDoc(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchDocument();
  }, [documentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-2">
        <p className="text-destructive">{error || "Document not found"}</p>
      </div>
    );
  }

  const status = statusConfig[doc.status] || statusConfig.draft;
  const versions = (doc.metadata?.versions as Array<{ id: string; version: string; date: string; author: string }>) || [];
  const sharedWith = (doc.metadata?.shared_with as Array<{ id: string; name: string }>) || [];
  const tags = (doc.metadata?.tags as string[]) || [];

  const breadcrumbs = [
    { label: "Documents", href: "/documents" },
    ...(doc.folder ? [{ label: doc.folder, href: `/documents?folder=${doc.folder}` }] : []),
    { label: doc.name },
  ];

  const tabs = [
    {
      id: "preview",
      label: "Preview",
      content: (
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center h-[400px] bg-muted rounded-lg">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Document preview would appear here</p>
              <Button className="mt-4">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      id: "versions",
      label: "Versions",
      badge: versions.length,
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Version History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {versions.length > 0 ? versions.map((version: { id: string; version: string; date: string; author: string }, index: number) => (
                <div key={version.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={index === 0 ? "default" : "outline"}>v{version.version}</Badge>
                    <div>
                      <p className="text-sm font-medium">{version.author}</p>
                      <p className="text-xs text-muted-foreground">{new Date(version.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )) : (
                <p className="text-muted-foreground">No version history</p>
              )}
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      id: "sharing",
      label: "Sharing",
      badge: sharedWith.length,
      content: (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Shared With
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sharedWith.length > 0 ? sharedWith.map((person: { id: string; name: string }) => (
                <div key={person.id} className="flex items-center gap-3 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {person.name.split(" ").map((n: string) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{person.name}</span>
                </div>
              )) : (
                <p className="text-muted-foreground">Not shared with anyone</p>
              )}
            </div>
          </CardContent>
        </Card>
      ),
    },
  ];

  const sidebarContent = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Type</span>
            <Badge variant="outline">{(doc.file_type || "unknown").toUpperCase()}</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Size</span>
            <span className="text-sm font-medium">{doc.file_size || "N/A"}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Folder</span>
            <span className="text-sm font-medium">{doc.folder || "Root"}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Owner</CardTitle>
        </CardHeader>
        <CardContent>
          {doc.owner ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {doc.owner.name.split(" ").map((n: string) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{doc.owner.name}</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Unknown</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm">{doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "N/A"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Modified</p>
              <p className="text-sm">{doc.updated_at ? new Date(doc.updated_at).toLocaleDateString() : "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tags.length > 0 ? tags.map((tag: string) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            )) : (
              <p className="text-sm text-muted-foreground">No tags</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <EntityDetailPage
      title={doc.name}
      status={{ label: status.label, variant: status.variant }}
      breadcrumbs={breadcrumbs}
      backHref="/documents"
      editHref={`/documents/${documentId}/edit`}
      onDelete={() => console.log("Delete document")}
      onShare={() => console.log("Share document")}
      tabs={tabs}
      defaultTab="preview"
      sidebarContent={sidebarContent}
      actions={[
        { id: "download", label: "Download", onClick: () => console.log("Download") },
        { id: "duplicate", label: "Duplicate", onClick: () => console.log("Duplicate") },
        { id: "move", label: "Move to Folder", onClick: () => console.log("Move") },
      ]}
    />
  );
}
