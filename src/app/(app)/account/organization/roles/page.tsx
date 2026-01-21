"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { rolesPageConfig } from "@/config/pages/roles";

interface Role {
  id: string;
  name: string;
  description: string;
  members: number;
  is_system: boolean;
}

export default function AccountOrganizationRolesPage() {
  const [rolesData, setRolesData] = React.useState<Role[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchRoles() {
      try {
        const response = await fetch("/api/v1/account/organization/roles");
        if (response.ok) {
          const result = await response.json();
          setRolesData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRoles();
  }, []);

  const stats = React.useMemo(() => {
    const totalMembers = rolesData.reduce((acc, r) => acc + (r.members || 0), 0);
    const systemRoles = rolesData.filter((r) => r.is_system).length;
    const customRoles = rolesData.filter((r) => !r.is_system).length;
    return [
      { id: "total", label: "Total Roles", value: rolesData.length },
      { id: "system", label: "System Roles", value: systemRoles },
      { id: "custom", label: "Custom Roles", value: customRoles },
      { id: "members", label: "Total Members", value: totalMembers },
    ];
  }, [rolesData]);

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
    <DataViewPage<Role>
      config={rolesPageConfig}
      data={rolesData}
      stats={stats}
      getRowId={(r) => r.id}
      searchFields={["name", "description"]}
      onAction={handleAction}
    />
  );
}
