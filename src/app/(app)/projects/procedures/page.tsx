"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { proceduresPageConfig } from "@/config/pages/procedures";

interface Procedure {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: number;
  lastUpdated: string;
  owner: string;
  status: string;
  version: string;
  completions: number;
}

export default function ProceduresPage() {
  const [proceduresData, setProceduresData] = React.useState<Procedure[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchProcedures() {
      try {
        const response = await fetch("/api/v1/procedures");
        if (response.ok) {
          const result = await response.json();
          setProceduresData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch procedures:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProcedures();
  }, []);

  const stats = React.useMemo(() => {
    const activeCount = proceduresData.filter((p) => p.status === "active").length;
    const categories = new Set(proceduresData.map((p) => p.category));
    const totalSteps = proceduresData.reduce((acc, p) => acc + (p.steps || 0), 0);
    return [
      { id: "total", label: "Total Procedures", value: proceduresData.length },
      { id: "active", label: "Active", value: activeCount },
      { id: "categories", label: "Categories", value: categories.size },
      { id: "steps", label: "Total Steps", value: totalSteps },
    ];
  }, [proceduresData]);

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
    <DataViewPage<Procedure>
      config={proceduresPageConfig}
      data={proceduresData}
      stats={stats}
      getRowId={(p) => p.id}
      searchFields={["name", "category", "owner"]}
      onAction={handleAction}
    />
  );
}
