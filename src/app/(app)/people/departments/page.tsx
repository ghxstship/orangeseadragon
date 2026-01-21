"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { departmentsPageConfig } from "@/config/pages/departments";

interface Department {
  id: string;
  name: string;
  description: string;
  head: string;
  member_count: number;
  status: "active" | "inactive";
  created_at: string;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchDepartments() {
      try {
        const response = await fetch("/api/v1/departments");
        if (response.ok) {
          const result = await response.json();
          setDepartments(result.data || []);
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
    const totalMembers = departments.reduce((acc, d) => acc + (d.member_count || 0), 0);
    const activeDepts = departments.filter((d) => d.status === "active").length;

    return [
      { id: "total", label: "Total Departments", value: departments.length },
      { id: "active", label: "Active", value: activeDepts },
      { id: "members", label: "Total Members", value: totalMembers },
      { id: "avg", label: "Avg Size", value: departments.length > 0 ? Math.round(totalMembers / departments.length) : 0 },
    ];
  }, [departments]);

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
      data={departments}
      stats={stats}
      getRowId={(d) => d.id}
      searchFields={["name", "head", "description"]}
      onAction={handleAction}
    />
  );
}
