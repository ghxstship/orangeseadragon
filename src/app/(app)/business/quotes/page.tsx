"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { quotesPageConfig } from "@/config/pages/quotes";
import { QUOTE_STATUS, type QuoteStatus } from "@/lib/enums";

interface Quote {
  id: string;
  quote_number: string;
  client_name: string;
  client_company: string;
  event_name?: string;
  amount: number;
  status: QuoteStatus;
  created_date: string;
  valid_until: string;
  items: number;
}

export default function QuotesPage() {
  const [quotesData, setQuotesData] = React.useState<Quote[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchQuotes() {
      try {
        const response = await fetch("/api/v1/quotes");
        if (response.ok) {
          const result = await response.json();
          setQuotesData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch quotes:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchQuotes();
  }, []);

  const stats = React.useMemo(() => {
    const totalAmount = quotesData.reduce((acc, q) => acc + (q.amount || 0), 0);
    const acceptedAmount = quotesData.filter((q) => q.status === QUOTE_STATUS.ACCEPTED).reduce((acc, q) => acc + (q.amount || 0), 0);
    const pendingAmount = quotesData.filter((q) => q.status === QUOTE_STATUS.SENT).reduce((acc, q) => acc + (q.amount || 0), 0);

    return [
      { id: "totalAmount", label: "Total Quoted", value: totalAmount, format: "currency" as const },
      { id: "accepted", label: "Accepted", value: acceptedAmount, format: "currency" as const },
      { id: "pending", label: "Pending", value: pendingAmount, format: "currency" as const },
      { id: "total", label: "Total Quotes", value: quotesData.length },
    ];
  }, [quotesData]);

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
    <DataViewPage<Quote>
      config={quotesPageConfig}
      data={quotesData}
      stats={stats}
      getRowId={(q) => q.id}
      searchFields={["quote_number", "client_name", "client_company", "event_name"]}
      onAction={handleAction}
    />
  );
}
