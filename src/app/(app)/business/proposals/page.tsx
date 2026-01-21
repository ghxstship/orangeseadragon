"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { proposalsPageConfig } from "@/config/pages/proposals";
import { PROPOSAL_STATUS, type ProposalStatus } from "@/lib/enums";

interface Proposal {
  id: string;
  title: string;
  client: string;
  value: number;
  status: ProposalStatus;
  created_date: string;
  sent_date?: string;
  expiry_date?: string;
  created_by: string;
}

export default function ProposalsPage() {
  const [proposalsData, setProposalsData] = React.useState<Proposal[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchProposals() {
      try {
        const response = await fetch("/api/v1/proposals");
        if (response.ok) {
          const result = await response.json();
          setProposalsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch proposals:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProposals();
  }, []);

  const stats = React.useMemo(() => {
    const pending = proposalsData.filter((p) => p.status === PROPOSAL_STATUS.SENT || p.status === PROPOSAL_STATUS.VIEWED).length;
    const accepted = proposalsData.filter((p) => p.status === PROPOSAL_STATUS.ACCEPTED).length;
    const totalValue = proposalsData.filter((p) => p.status === PROPOSAL_STATUS.ACCEPTED).reduce((acc, p) => acc + (p.value || 0), 0);

    return [
      { id: "total", label: "Total Proposals", value: proposalsData.length },
      { id: "pending", label: "Pending Response", value: pending },
      { id: "accepted", label: "Accepted", value: accepted },
      { id: "value", label: "Won Value", value: totalValue, format: "currency" as const },
    ];
  }, [proposalsData]);

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
    <DataViewPage<Proposal>
      config={proposalsPageConfig}
      data={proposalsData}
      stats={stats}
      getRowId={(p) => p.id}
      searchFields={["title", "client", "created_by"]}
      onAction={handleAction}
    />
  );
}
