"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { pipelineProposalsPageConfig } from "@/config/pages/pipeline-proposals";
import { type ProposalStatus } from "@/lib/enums";

interface Proposal {
  id: string;
  name: string;
  company: string;
  value: string;
  status: ProposalStatus;
  sent_at: string;
  expires_at: string;
}

export default function PipelineProposalsPage() {
  const [proposalsData, setProposalsData] = React.useState<Proposal[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchProposals() {
      try {
        const response = await fetch("/api/v1/pipeline/proposals");
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
      config={pipelineProposalsPageConfig}
      data={proposalsData}
      getRowId={(p) => p.id}
      searchFields={["name", "company"]}
      onAction={handleAction}
    />
  );
}
