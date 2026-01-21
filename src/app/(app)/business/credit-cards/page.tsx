"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { creditCardsPageConfig } from "@/config/pages/credit-cards";

interface CreditCardAccount {
  id: string;
  name: string;
  card_type: "visa" | "mastercard" | "amex" | "discover";
  last_four: string;
  expiry_date: string;
  credit_limit: number;
  current_balance: number;
  available_credit: number;
  status: "active" | "locked" | "expired";
  due_date: string;
  minimum_payment: number;
  assigned_to?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function CreditCardsPage() {
  const [creditCardsData, setCreditCardsData] = React.useState<CreditCardAccount[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCreditCards() {
      try {
        const response = await fetch("/api/v1/credit-cards");
        if (response.ok) {
          const result = await response.json();
          setCreditCardsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch credit cards:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCreditCards();
  }, []);

  const stats = React.useMemo(() => {
    const totalLimit = creditCardsData.reduce((acc, c) => acc + (c.credit_limit || 0), 0);
    const totalBalance = creditCardsData.reduce((acc, c) => acc + (c.current_balance || 0), 0);
    const totalAvailable = creditCardsData.reduce((acc, c) => acc + (c.available_credit || 0), 0);
    const utilizationRate = totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 100) : 0;

    return [
      { id: "limit", label: "Total Credit Limit", value: formatCurrency(totalLimit) },
      { id: "balance", label: "Current Balance", value: formatCurrency(totalBalance) },
      { id: "available", label: "Available Credit", value: formatCurrency(totalAvailable) },
      { id: "utilization", label: "Utilization Rate", value: `${utilizationRate}%` },
    ];
  }, [creditCardsData]);

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
    <DataViewPage<CreditCardAccount>
      config={creditCardsPageConfig}
      data={creditCardsData}
      stats={stats}
      getRowId={(c) => c.id}
      searchFields={["name", "last_four", "assigned_to"]}
      onAction={handleAction}
    />
  );
}
