"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { paymentsPageConfig } from "@/config/pages/payments";

interface Payment {
  id: string;
  transaction_id: string;
  type: "incoming" | "outgoing" | "refund";
  amount: number;
  status: "completed" | "pending" | "failed" | "refunded";
  method: "credit_card" | "bank_transfer" | "check" | "cash";
  party_name: string;
  party_company: string;
  description: string;
  date: string;
  invoice_number?: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchPayments() {
      try {
        const response = await fetch("/api/v1/payments");
        if (response.ok) {
          const result = await response.json();
          setPayments(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch payments:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, []);

  const stats = React.useMemo(() => {
    const incomingTotal = payments.filter((p) => p.type === "incoming" && p.status === "completed").reduce((acc, p) => acc + (p.amount || 0), 0);
    const outgoingTotal = payments.filter((p) => p.type === "outgoing" && p.status === "completed").reduce((acc, p) => acc + (p.amount || 0), 0);
    const pendingTotal = payments.filter((p) => p.status === "pending").reduce((acc, p) => acc + (p.amount || 0), 0);
    return [
      { id: "total", label: "Total Transactions", value: payments.length },
      { id: "incoming", label: "Incoming", value: incomingTotal, format: "currency" as const },
      { id: "outgoing", label: "Outgoing", value: outgoingTotal, format: "currency" as const },
      { id: "pending", label: "Pending", value: pendingTotal, format: "currency" as const },
    ];
  }, [payments]);

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
    <DataViewPage<Payment>
      config={paymentsPageConfig}
      data={payments}
      stats={stats}
      getRowId={(p) => p.id}
      searchFields={["transaction_id", "party_name", "party_company", "description"]}
      onAction={handleAction}
    />
  );
}
