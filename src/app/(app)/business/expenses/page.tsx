"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { expensesPageConfig } from "@/config/pages/expenses";
import { EXPENSE_STATUS, type ExpenseStatus } from "@/lib/enums";

interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  submitted_by: string;
  project?: string;
  status: ExpenseStatus;
  receipt_attached: boolean;
  payment_method: string;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchExpenses() {
      try {
        const response = await fetch("/api/v1/expenses");
        if (response.ok) {
          const result = await response.json();
          setExpenses(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch expenses:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchExpenses();
  }, []);

  const stats = React.useMemo(() => {
    const pendingApproval = expenses.filter((e) => e.status === EXPENSE_STATUS.SUBMITTED).length;
    const totalAmount = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    const pendingReimbursement = expenses.filter((e) => e.status === EXPENSE_STATUS.APPROVED).reduce((acc, e) => acc + (e.amount || 0), 0);
    return [
      { id: "total", label: "Total Expenses", value: expenses.length },
      { id: "pending", label: "Pending Approval", value: pendingApproval },
      { id: "amount", label: "Total Amount", value: totalAmount, format: "currency" as const },
      { id: "reimbursement", label: "Pending Reimbursement", value: pendingReimbursement, format: "currency" as const },
    ];
  }, [expenses]);

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
    <DataViewPage<Expense>
      config={expensesPageConfig}
      data={expenses}
      stats={stats}
      getRowId={(e) => e.id}
      searchFields={["description", "category"]}
      onAction={handleAction}
    />
  );
}
