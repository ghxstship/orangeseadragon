"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { templatesPageConfig } from "@/config/pages/templates";

interface Template {
  id: string;
  name: string;
  format: string;
  downloads: number;
}

export default function AccountResourcesTemplatesPage() {
  const [templatesData, setTemplatesData] = React.useState<Template[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await fetch("/api/v1/account/resources/templates");
        if (response.ok) {
          const result = await response.json();
          setTemplatesData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch templates:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  const stats = React.useMemo(() => {
    const totalDownloads = templatesData.reduce((acc, t) => acc + (t.downloads || 0), 0);
    return [
      { id: "total", label: "Total Templates", value: templatesData.length },
      { id: "downloads", label: "Total Downloads", value: totalDownloads },
    ];
  }, [templatesData]);

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
    <DataViewPage<Template>
      config={templatesPageConfig}
      data={templatesData}
      stats={stats}
      getRowId={(t) => t.id}
      searchFields={["name"]}
      onAction={handleAction}
    />
  );
}
