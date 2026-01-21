"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { documentsPageConfig } from "@/config/pages/documents";
import { DOCUMENT_STATUS, type DocumentStatus, type DocumentType } from "@/lib/enums";

interface Document {
  id: string;
  title: string;
  type: DocumentType;
  status: DocumentStatus;
  folder: string;
  created_by: string;
  updated_at: string;
  word_count: number;
  is_starred: boolean;
  shared_with: number;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchDocuments() {
      try {
        const response = await fetch("/api/v1/documents");
        if (response.ok) {
          const result = await response.json();
          setDocuments(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDocuments();
  }, []);

  const stats = React.useMemo(() => {
    return [
      { id: "total", label: "Total Documents", value: documents.length },
      { id: "published", label: "Published", value: documents.filter((d) => d.status === DOCUMENT_STATUS.PUBLISHED).length },
      { id: "drafts", label: "Drafts", value: documents.filter((d) => d.status === DOCUMENT_STATUS.DRAFT).length },
      { id: "starred", label: "Starred", value: documents.filter((d) => d.is_starred).length },
    ];
  }, [documents]);

  const handleAction = React.useCallback((actionId: string, payload?: unknown) => {
    console.log("Action:", actionId, payload);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DataViewPage<Document>
      config={documentsPageConfig}
      data={documents}
      stats={stats}
      getRowId={(d) => d.id}
      searchFields={["title", "folder"]}
      onAction={handleAction}
    />
  );
}
