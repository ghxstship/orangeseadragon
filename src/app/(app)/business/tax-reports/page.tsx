"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { taxReportsPageConfig } from "@/config/pages/tax-reports";
import { TAX_REPORT_STATUS, type TaxReportStatus } from "@/lib/enums";

interface TaxReport {
  id: string;
  name: string;
  type: "quarterly" | "annual" | "sales_tax" | "payroll" | "1099";
  period: string;
  due_date: string;
  status: TaxReportStatus;
  amount?: number;
  filed_date?: string;
}

export default function TaxReportsPage() {
  const [taxReportsData, setTaxReportsData] = React.useState<TaxReport[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchTaxReports() {
      try {
        const response = await fetch("/api/v1/tax-reports");
        if (response.ok) {
          const result = await response.json();
          setTaxReportsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch tax reports:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTaxReports();
  }, []);

  const stats = React.useMemo(() => {
    const filedCount = taxReportsData.filter((r) => r.status === TAX_REPORT_STATUS.FILED).length;
    const pendingCount = taxReportsData.filter((r) => r.status === TAX_REPORT_STATUS.PENDING || r.status === TAX_REPORT_STATUS.DRAFT).length;
    const overdueCount = taxReportsData.filter((r) => r.status === TAX_REPORT_STATUS.OVERDUE).length;
    return [
      { id: "total", label: "Total Reports", value: taxReportsData.length },
      { id: "filed", label: "Filed", value: filedCount },
      { id: "pending", label: "Pending", value: pendingCount },
      { id: "overdue", label: "Overdue", value: overdueCount },
    ];
  }, [taxReportsData]);

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
    <DataViewPage<TaxReport>
      config={taxReportsPageConfig}
      data={taxReportsData}
      stats={stats}
      getRowId={(r) => r.id}
      searchFields={["name", "period"]}
      onAction={handleAction}
    />
  );
}
