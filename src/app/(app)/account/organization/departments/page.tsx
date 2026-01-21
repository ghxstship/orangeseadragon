"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { departmentsPageConfig } from "@/config/pages/departments";

interface Department {
  id: string;
  name: string;
  head: string;
  members: number;
}

export default function AccountOrganizationDepartmentsPage() {
  const [departmentsData, setDepartmentsData] = React.useState<Department[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchDepartments() {
      try {
        const response = await fetch("/api/v1/account/organization/departments");
        if (response.ok) {
          const result = await response.json();
          setDepartmentsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch departments:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDepartments();
  }, []);

  const stats = React.useMemo(() => {
    const totalMembers = departmentsData.reduce((acc, d) => acc + (d.members || 0), 0);
    return [
      { id: "total", label: "Total Departments", value: departmentsData.length },
      { id: "members", label: "Total Members", value: totalMembers },
    ];
  }, [departmentsData]);

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
    <DataViewPage<Department>
      config={departmentsPageConfig}
      data={departmentsData}
      stats={stats}
      getRowId={(d) => d.id}
      searchFields={["name", "head"]}
      onAction={handleAction}
    />
  );
}
