"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { dataLineagePageConfig } from "@/config/pages/data-lineage";

interface LineageNode {
  id: string;
  name: string;
  type: "source" | "transformation" | "destination";
  system: string;
  upstream: string[];
  downstream: string[];
}

export default function DataLineagePage() {
  const [lineageNodesData, setLineageNodesData] = React.useState<LineageNode[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchLineageNodes() {
      try {
        const response = await fetch("/api/v1/data-lineage");
        if (response.ok) {
          const result = await response.json();
          setLineageNodesData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch lineage nodes:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLineageNodes();
  }, []);

  const stats = React.useMemo(() => {
    const sources = lineageNodesData.filter((n) => n.type === "source").length;
    const transforms = lineageNodesData.filter((n) => n.type === "transformation").length;
    const destinations = lineageNodesData.filter((n) => n.type === "destination").length;

    return [
      { id: "total", label: "Total Nodes", value: lineageNodesData.length },
      { id: "sources", label: "Sources", value: sources },
      { id: "transforms", label: "Transformations", value: transforms },
      { id: "destinations", label: "Destinations", value: destinations },
    ];
  }, [lineageNodesData]);

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
    <DataViewPage<LineageNode>
      config={dataLineagePageConfig}
      data={lineageNodesData}
      stats={stats}
      getRowId={(n) => n.id}
      searchFields={["name", "system"]}
      onAction={handleAction}
    />
  );
}
