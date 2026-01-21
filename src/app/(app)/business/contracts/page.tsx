"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { contractsPageConfig } from "@/config/pages/contracts";
import { CONTRACT_STATUS, type ContractStatus, type ContractType } from "@/lib/enums";

interface Contract {
  id: string;
  title: string;
  counterparty: string;
  type: ContractType;
  value: number;
  start_date: string;
  end_date: string;
  status: ContractStatus;
  renewal_date?: string;
  auto_renew: boolean;
}

export default function ContractsPage() {
  const [contracts, setContracts] = React.useState<Contract[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchContracts() {
      try {
        const response = await fetch("/api/v1/contracts");
        if (response.ok) {
          const result = await response.json();
          setContracts(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch contracts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchContracts();
  }, []);

  const stats = React.useMemo(() => {
    const activeContracts = contracts.filter((c) => c.status === CONTRACT_STATUS.ACTIVE).length;
    const totalValue = contracts.filter((c) => c.status === CONTRACT_STATUS.ACTIVE).reduce((acc, c) => acc + (c.value || 0), 0);
    const pendingSignature = contracts.filter((c) => c.status === CONTRACT_STATUS.PENDING_SIGNATURE).length;
    return [
      { id: "total", label: "Total Contracts", value: contracts.length },
      { id: "active", label: "Active Contracts", value: activeContracts },
      { id: "value", label: "Active Contract Value", value: totalValue, format: "currency" as const },
      { id: "pending", label: "Pending Signature", value: pendingSignature },
    ];
  }, [contracts]);

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
    <DataViewPage<Contract>
      config={contractsPageConfig}
      data={contracts}
      stats={stats}
      getRowId={(c) => c.id}
      searchFields={["title", "counterparty"]}
      onAction={handleAction}
    />
  );
}
