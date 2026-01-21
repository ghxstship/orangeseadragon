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
  Plus,
  MoreHorizontal,
  FileText,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";

interface GLAccount {
  id: string;
  accountNumber: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  category: string;
  balance: number;
  status: "active" | "inactive";
  lastActivity?: string;
}

const glAccounts: GLAccount[] = [
  {
    id: "1",
    accountNumber: "1000",
    name: "Cash and Cash Equivalents",
    type: "asset",
    category: "Current Assets",
    balance: 1250000,
    status: "active",
    lastActivity: "2024-06-15",
  },
  {
    id: "2",
    accountNumber: "1100",
    name: "Accounts Receivable",
    type: "asset",
    category: "Current Assets",
    balance: 485000,
    status: "active",
    lastActivity: "2024-06-15",
  },
  {
    id: "3",
    accountNumber: "2000",
    name: "Accounts Payable",
    type: "liability",
    category: "Current Liabilities",
    balance: 320000,
    status: "active",
    lastActivity: "2024-06-14",
  },
  {
    id: "4",
    accountNumber: "3000",
    name: "Retained Earnings",
    type: "equity",
    category: "Equity",
    balance: 850000,
    status: "active",
    lastActivity: "2024-05-31",
  },
  {
    id: "5",
    accountNumber: "4000",
    name: "Ticket Revenue",
    type: "revenue",
    category: "Operating Revenue",
    balance: 2150000,
    status: "active",
    lastActivity: "2024-06-15",
  },
  {
    id: "6",
    accountNumber: "4100",
    name: "Sponsorship Revenue",
    type: "revenue",
    category: "Operating Revenue",
    balance: 750000,
    status: "active",
    lastActivity: "2024-06-10",
  },
  {
    id: "7",
    accountNumber: "5000",
    name: "Production Expenses",
    type: "expense",
    category: "Operating Expenses",
    balance: 680000,
    status: "active",
    lastActivity: "2024-06-15",
  },
  {
    id: "8",
    accountNumber: "5100",
    name: "Marketing Expenses",
    type: "expense",
    category: "Operating Expenses",
    balance: 225000,
    status: "active",
    lastActivity: "2024-06-14",
  },
];

const typeConfig: Record<string, { label: string; color: string }> = {
  asset: { label: "Asset", color: "bg-blue-500" },
  liability: { label: "Liability", color: "bg-red-500" },
  equity: { label: "Equity", color: "bg-purple-500" },
  revenue: { label: "Revenue", color: "bg-green-500" },
  expense: { label: "Expense", color: "bg-orange-500" },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function GLAccountsPage() {
  const totalAssets = glAccounts.filter((a) => a.type === "asset").reduce((acc, a) => acc + a.balance, 0);
  const totalLiabilities = glAccounts.filter((a) => a.type === "liability").reduce((acc, a) => acc + a.balance, 0);
  const totalRevenue = glAccounts.filter((a) => a.type === "revenue").reduce((acc, a) => acc + a.balance, 0);
  const totalExpenses = glAccounts.filter((a) => a.type === "expense").reduce((acc, a) => acc + a.balance, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chart of Accounts"
        description="General ledger account structure"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Total Assets"
          value={formatCurrency(totalAssets)}
          valueClassName="text-blue-500"
          icon={DollarSign}
        />
        <StatCard
          title="Total Liabilities"
          value={formatCurrency(totalLiabilities)}
          valueClassName="text-red-500"
          icon={TrendingDown}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          valueClassName="text-green-500"
          icon={TrendingUp}
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          valueClassName="text-orange-500"
          icon={TrendingDown}
        />
      </StatGrid>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search accounts..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Ledger Accounts</CardTitle>
          <CardDescription>All chart of accounts entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {glAccounts.map((account) => {
              const type = typeConfig[account.type];

              return (
                <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium">{account.accountNumber}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium">{account.name}</h4>
                        <Badge className={`${type.color} text-white`}>
                          {type.label}
                        </Badge>
                        {account.status === "inactive" && (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {account.category}
                        {account.lastActivity && ` • Last activity: ${formatDate(account.lastActivity)}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${account.type === "liability" || account.type === "expense" ? "text-red-500" : ""}`}>
                        {formatCurrency(account.balance)}
                      </p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Transactions</DropdownMenuItem>
                        <DropdownMenuItem>View Ledger</DropdownMenuItem>
                        <DropdownMenuItem>Edit Account</DropdownMenuItem>
                        <DropdownMenuItem>Add Sub-Account</DropdownMenuItem>
                        {account.status === "active" ? (
                          <DropdownMenuItem className="text-yellow-600">Deactivate</DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-green-600">Activate</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
