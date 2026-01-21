"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { bankAccountsPageConfig } from "@/config/pages/bank-accounts";

interface BankAccount {
  id: string;
  name: string;
  bank_name: string;
  account_type: "checking" | "savings" | "credit" | "merchant";
  account_number: string;
  balance: number;
  currency: string;
  status: "active" | "inactive" | "pending";
  last_sync: string;
  is_primary: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function BankAccountsPage() {
  const [bankAccounts, setBankAccounts] = React.useState<BankAccount[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchBankAccounts() {
      try {
        const response = await fetch("/api/v1/bank-accounts");
        if (response.ok) {
          const result = await response.json();
          setBankAccounts(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch bank accounts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBankAccounts();
  }, []);

  const stats = React.useMemo(() => {
    const totalBalance = bankAccounts.reduce((acc, a) => acc + (a.balance || 0), 0);
    const activeAccounts = bankAccounts.filter((a) => a.status === "active").length;

    return [
      { id: "totalBalance", label: "Total Balance", value: formatCurrency(totalBalance) },
      { id: "connected", label: "Connected Accounts", value: bankAccounts.length },
      { id: "active", label: "Active Accounts", value: activeAccounts },
    ];
  }, [bankAccounts]);

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
    <DataViewPage<BankAccount>
      config={bankAccountsPageConfig}
      data={bankAccounts}
      stats={stats}
      getRowId={(a) => a.id}
      searchFields={["name", "bank_name"]}
      onAction={handleAction}
    />
  );
}
