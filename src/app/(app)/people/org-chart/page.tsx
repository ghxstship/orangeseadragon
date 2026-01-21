"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { HierarchyPage } from "@/components/common";
import { peopleOrgChartPageConfig } from "@/config/pages/people-org-chart";

interface OrgPerson {
  id: string;
  name: string;
  title: string;
  parent_id: string | null;
  avatar?: string;
}

export default function PeopleOrgChartPage() {
  const [orgData, setOrgData] = React.useState<OrgPerson[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchOrgData() {
      try {
        const response = await fetch("/api/v1/people/org-chart");
        if (response.ok) {
          const result = await response.json();
          setOrgData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch org chart data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrgData();
  }, []);

  const handleAction = React.useCallback((actionId: string, payload?: unknown) => {
    console.log("Org chart action:", actionId, payload);
  }, []);

  const handleNodeClick = React.useCallback((node: OrgPerson) => {
    console.log("Node clicked:", node);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <HierarchyPage
      config={peopleOrgChartPageConfig}
      data={orgData}
      getNodeId={(node) => node.id}
      onAction={handleAction}
      onNodeClick={handleNodeClick}
    />
  );
}
