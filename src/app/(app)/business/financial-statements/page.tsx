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
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart,
  DollarSign,
  Percent,
} from "lucide-react";

interface FinancialStatement {
  id: string;
  name: string;
  type: "income" | "balance" | "cashflow" | "equity";
  period: string;
  generatedDate: string;
  status: "current" | "draft" | "archived";
}

const statements: FinancialStatement[] = [
  {
    id: "1",
    name: "Income Statement",
    type: "income",
    period: "Q2 2024",
    generatedDate: "2024-06-15",
    status: "current",
  },
  {
    id: "2",
    name: "Balance Sheet",
    type: "balance",
    period: "Q2 2024",
    generatedDate: "2024-06-15",
    status: "current",
  },
  {
    id: "3",
    name: "Cash Flow Statement",
    type: "cashflow",
    period: "Q2 2024",
    generatedDate: "2024-06-15",
    status: "current",
  },
  {
    id: "4",
    name: "Statement of Equity",
    type: "equity",
    period: "Q2 2024",
    generatedDate: "2024-06-15",
    status: "current",
  },
];

const typeConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  income: { label: "Income Statement", color: "bg-green-500", icon: TrendingUp },
  balance: { label: "Balance Sheet", color: "bg-blue-500", icon: BarChart3 },
  cashflow: { label: "Cash Flow", color: "bg-purple-500", icon: DollarSign },
  equity: { label: "Equity", color: "bg-orange-500", icon: PieChart },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function FinancialStatementsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Statements"
        description="View and generate financial reports"
        actions={
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Generate Statements
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Total Revenue"
          value={formatCurrency(2900000)}
          valueClassName="text-green-500"
          icon={TrendingUp}
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(1850000)}
          valueClassName="text-orange-500"
          icon={BarChart3}
        />
        <StatCard
          title="Net Income"
          value={formatCurrency(1050000)}
          icon={DollarSign}
        />
        <StatCard
          title="Profit Margin"
          value="36.2%"
          icon={Percent}
        />
      </StatGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        {statements.map((statement) => {
          const type = typeConfig[statement.type];
          const TypeIcon = type.icon;

          return (
            <Card key={statement.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${type.color}`}>
                      <TypeIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{statement.name}</CardTitle>
                      <CardDescription>{statement.period}</CardDescription>
                    </div>
                  </div>
                  <Badge className={`${type.color} text-white`}>
                    {statement.status === "current" ? "Current" : statement.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {statement.type === "income" && (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Revenue</span>
                      <span className="font-medium text-green-500">{formatCurrency(2900000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cost of Goods Sold</span>
                      <span className="font-medium">{formatCurrency(1200000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gross Profit</span>
                      <span className="font-medium">{formatCurrency(1700000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Operating Expenses</span>
                      <span className="font-medium">{formatCurrency(650000)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-bold">
                      <span>Net Income</span>
                      <span className="text-green-500">{formatCurrency(1050000)}</span>
                    </div>
                  </div>
                )}

                {statement.type === "balance" && (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Assets</span>
                      <span className="font-medium text-blue-500">{formatCurrency(4250000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Liabilities</span>
                      <span className="font-medium text-red-500">{formatCurrency(1850000)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-bold">
                      <span>Total Equity</span>
                      <span>{formatCurrency(2400000)}</span>
                    </div>
                  </div>
                )}

                {statement.type === "cashflow" && (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Operating Activities</span>
                      <span className="font-medium text-green-500">{formatCurrency(1150000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Investing Activities</span>
                      <span className="font-medium text-red-500">({formatCurrency(350000)})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Financing Activities</span>
                      <span className="font-medium text-red-500">({formatCurrency(200000)})</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-bold">
                      <span>Net Change in Cash</span>
                      <span className="text-green-500">{formatCurrency(600000)}</span>
                    </div>
                  </div>
                )}

                {statement.type === "equity" && (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Beginning Equity</span>
                      <span className="font-medium">{formatCurrency(1850000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Net Income</span>
                      <span className="font-medium text-green-500">{formatCurrency(1050000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dividends</span>
                      <span className="font-medium text-red-500">({formatCurrency(500000)})</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-bold">
                      <span>Ending Equity</span>
                      <span>{formatCurrency(2400000)}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Generated: {formatDate(statement.generatedDate)}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Full Report
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
