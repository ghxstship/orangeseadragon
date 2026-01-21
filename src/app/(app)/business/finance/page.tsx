"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  DollarSign,
  TrendingUp,
  FileText,
  CreditCard,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
} from "lucide-react";
import { INVOICE_STATUS, type InvoiceStatus } from "@/lib/enums";
import { formatCurrency as formatCurrencyUtil, DEFAULT_CURRENCY } from "@/lib/config";

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
  direction: "receivable" | "payable";
}

const invoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-001",
    clientName: "Acme Corp",
    amount: 25000,
    status: INVOICE_STATUS.PAID,
    dueDate: "2024-01-15",
    direction: "receivable",
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-002",
    clientName: "TechStart Inc",
    amount: 45000,
    status: INVOICE_STATUS.SENT,
    dueDate: "2024-02-01",
    direction: "receivable",
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-003",
    clientName: "Global Events LLC",
    amount: 12500,
    status: INVOICE_STATUS.OVERDUE,
    dueDate: "2024-01-10",
    direction: "receivable",
  },
  {
    id: "4",
    invoiceNumber: "PO-2024-001",
    clientName: "Sound Systems Pro",
    amount: 8500,
    status: INVOICE_STATUS.PAID,
    dueDate: "2024-01-20",
    direction: "payable",
  },
  {
    id: "5",
    invoiceNumber: "INV-2024-004",
    clientName: "Festival Partners",
    amount: 75000,
    status: INVOICE_STATUS.DRAFT,
    dueDate: "2024-02-15",
    direction: "receivable",
  },
  {
    id: "6",
    invoiceNumber: "PO-2024-002",
    clientName: "Lighting Warehouse",
    amount: 15000,
    status: INVOICE_STATUS.SENT,
    dueDate: "2024-02-05",
    direction: "payable",
  },
];

const statusConfig: Record<InvoiceStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  [INVOICE_STATUS.DRAFT]: { label: "Draft", variant: "secondary" },
  [INVOICE_STATUS.SENT]: { label: "Sent", variant: "default" },
  [INVOICE_STATUS.VIEWED]: { label: "Viewed", variant: "default" },
  [INVOICE_STATUS.PAID]: { label: "Paid", variant: "outline" },
  [INVOICE_STATUS.OVERDUE]: { label: "Overdue", variant: "destructive" },
  [INVOICE_STATUS.CANCELLED]: { label: "Cancelled", variant: "secondary" },
  [INVOICE_STATUS.PARTIALLY_PAID]: { label: "Partially Paid", variant: "default" },
  [INVOICE_STATUS.DISPUTED]: { label: "Disputed", variant: "destructive" },
};

function formatCurrency(amount: number): string {
  return formatCurrencyUtil(amount, DEFAULT_CURRENCY);
}

export default function FinancePage() {
  const receivables = invoices.filter((i) => i.direction === "receivable");
  const payables = invoices.filter((i) => i.direction === "payable");

  const stats = {
    totalReceivable: receivables.reduce((acc, i) => acc + i.amount, 0),
    totalPayable: payables.reduce((acc, i) => acc + i.amount, 0),
    overdue: invoices.filter((i) => i.status === INVOICE_STATUS.OVERDUE).reduce((acc, i) => acc + i.amount, 0),
    paidThisMonth: invoices.filter((i) => i.status === INVOICE_STATUS.PAID).reduce((acc, i) => acc + i.amount, 0),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance"
        description="Manage invoices, expenses, and budgets"
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Receipt className="mr-2 h-4 w-4" />
              New Expense
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </div>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Receivables"
          value={formatCurrency(stats.totalReceivable)}
          valueClassName="text-green-500"
          icon={ArrowDownRight}
        />
        <StatCard
          title="Payables"
          value={formatCurrency(stats.totalPayable)}
          valueClassName="text-red-500"
          icon={ArrowUpRight}
        />
        <StatCard
          title="Overdue"
          value={formatCurrency(stats.overdue)}
          valueClassName="text-orange-500"
          icon={AlertTriangle}
        />
        <StatCard
          title="Collected This Month"
          value={formatCurrency(stats.paidThisMonth)}
          valueClassName="text-blue-500"
          icon={TrendingUp}
        />
      </StatGrid>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search invoices..." className="pl-9" />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
        <Button variant="outline" size="sm">
          <FileText className="mr-2 h-4 w-4" />
          Receivables
        </Button>
        <Button variant="outline" size="sm">
          <CreditCard className="mr-2 h-4 w-4" />
          Payables
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>
            View and manage your invoices and bills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      invoice.direction === "receivable"
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-red-100 dark:bg-red-900/30"
                    }`}
                  >
                    <DollarSign
                      className={`h-4 w-4 ${
                        invoice.direction === "receivable"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{invoice.invoiceNumber}</p>
                      <Badge variant={statusConfig[invoice.status].variant}>
                        {statusConfig[invoice.status].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {invoice.clientName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        invoice.direction === "receivable"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {invoice.direction === "receivable" ? "+" : "-"}
                      {formatCurrency(invoice.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Due {invoice.dueDate}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Download PDF</DropdownMenuItem>
                      <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                      <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Void Invoice
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
