"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { approvalWorkflowsPageConfig } from "@/config/pages/approval-workflows";

interface ApprovalWorkflow {
  id: string;
  name: string;
  description: string;
  entity_type: "expense" | "purchase_order" | "contract" | "budget" | "event";
  steps: ApprovalStep[];
  enabled: boolean;
  pending_count: number;
}

interface ApprovalStep {
  order: number;
  name: string;
  approvers: string;
  condition?: string;
}

export default function ApprovalWorkflowsPage() {
  const [approvalWorkflows, setApprovalWorkflows] = React.useState<ApprovalWorkflow[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchApprovalWorkflows() {
      try {
        const response = await fetch("/api/v1/approval-workflows");
        if (response.ok) {
          const result = await response.json();
          setApprovalWorkflows(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch approval workflows:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchApprovalWorkflows();
  }, []);

  const stats = React.useMemo(() => {
    const enabledWorkflows = approvalWorkflows.filter((w) => w.enabled).length;
    const totalPending = approvalWorkflows.reduce((acc, w) => acc + (w.pending_count || 0), 0);
    const entityTypes = new Set(approvalWorkflows.map((w) => w.entity_type)).size;

    return [
      { id: "total", label: "Total Workflows", value: approvalWorkflows.length },
      { id: "active", label: "Active", value: enabledWorkflows },
      { id: "pending", label: "Pending Approvals", value: totalPending },
      { id: "entityTypes", label: "Entity Types", value: entityTypes },
    ];
  }, [approvalWorkflows]);

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
    <DataViewPage<ApprovalWorkflow>
      config={approvalWorkflowsPageConfig}
      data={approvalWorkflows}
      stats={stats}
      getRowId={(w) => w.id}
      searchFields={["name", "description"]}
      onAction={handleAction}
    />
  );
}
