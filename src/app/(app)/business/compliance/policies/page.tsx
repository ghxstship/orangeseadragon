"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { compliancePoliciesPageConfig } from "@/config/pages/compliance-policies";

interface Policy {
  id: string;
  name: string;
  version: string;
  status: string;
  last_updated: string;
  next_review: string;
}

export default function CompliancePoliciesPage() {
  const [policies, setPolicies] = React.useState<Policy[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchPolicies() {
      try {
        const response = await fetch("/api/v1/business/compliance/policies");
        if (response.ok) {
          const result = await response.json();
          setPolicies(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch policies:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPolicies();
  }, []);

  const stats = React.useMemo(() => {
    const activeCount = policies.filter((p) => p.status === "active").length;
    return [
      { id: "total", label: "Total Policies", value: policies.length },
      { id: "active", label: "Active", value: activeCount },
      { id: "review", label: "Due for Review", value: 0 },
    ];
  }, [policies]);

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
    <DataViewPage<Policy>
      config={compliancePoliciesPageConfig}
      data={policies}
      stats={stats}
      getRowId={(p) => p.id}
      searchFields={["name"]}
      onAction={handleAction}
    />
  );
}
