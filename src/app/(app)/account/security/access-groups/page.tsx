"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { accessGroupsPageConfig } from "@/config/pages/access-groups";

interface AccessGroup {
  id: string;
  name: string;
  description: string;
  member_count: number;
  permissions: number;
  type: "system" | "custom";
  created_at: string;
}

export default function AccessGroupsPage() {
  const [accessGroups, setAccessGroups] = React.useState<AccessGroup[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchAccessGroups() {
      try {
        const response = await fetch("/api/v1/access-groups");
        if (response.ok) {
          const result = await response.json();
          setAccessGroups(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch access groups:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAccessGroups();
  }, []);

  const stats = React.useMemo(() => {
    const totalMembers = accessGroups.reduce((acc, g) => acc + (g.member_count || 0), 0);
    const systemGroups = accessGroups.filter((g) => g.type === "system").length;
    const customGroups = accessGroups.filter((g) => g.type === "custom").length;
    return [
      { id: "total", label: "Total Groups", value: accessGroups.length },
      { id: "system", label: "System Groups", value: systemGroups },
      { id: "custom", label: "Custom Groups", value: customGroups },
      { id: "members", label: "Total Members", value: totalMembers },
    ];
  }, [accessGroups]);

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
    <DataViewPage<AccessGroup>
      config={accessGroupsPageConfig}
      data={accessGroups}
      stats={stats}
      getRowId={(g) => g.id}
      searchFields={["name", "description"]}
      onAction={handleAction}
    />
  );
}
