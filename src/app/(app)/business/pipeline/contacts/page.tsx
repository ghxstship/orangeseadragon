"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { pipelineContactsPageConfig } from "@/config/pages/pipeline-contacts";

interface PipelineContact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  role: string;
}

export default function PipelineContactsPage() {
  const [contactsData, setContactsData] = React.useState<PipelineContact[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchContacts() {
      try {
        const response = await fetch("/api/v1/pipeline/contacts");
        if (response.ok) {
          const result = await response.json();
          setContactsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchContacts();
  }, []);

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
    <DataViewPage<PipelineContact>
      config={pipelineContactsPageConfig}
      data={contactsData}
      getRowId={(c) => c.id}
      searchFields={["name", "company", "email"]}
      onAction={handleAction}
    />
  );
}
