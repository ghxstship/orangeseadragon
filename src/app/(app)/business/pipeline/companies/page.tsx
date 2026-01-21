"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { pipelineCompaniesPageConfig } from "@/config/pages/pipeline-companies";

interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  deals: number;
  value: string;
}

export default function PipelineCompaniesPage() {
  const [companiesData, setCompaniesData] = React.useState<Company[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCompanies() {
      try {
        const response = await fetch("/api/v1/pipeline/companies");
        if (response.ok) {
          const result = await response.json();
          setCompaniesData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch companies:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCompanies();
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
    <DataViewPage<Company>
      config={pipelineCompaniesPageConfig}
      data={companiesData}
      getRowId={(c) => c.id}
      searchFields={["name", "industry"]}
      onAction={handleAction}
    />
  );
}
