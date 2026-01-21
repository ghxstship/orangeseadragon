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
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  Download,
  Receipt,
} from "lucide-react";
import { PAYROLL_STATUS, type PayrollStatus } from "@/lib/enums";
import { formatCurrency as formatCurrencyUtil, DEFAULT_CURRENCY } from "@/lib/config";

interface PayrollRun {
  id: string;
  period: string;
  payDate: string;
  employeeCount: number;
  grossPay: number;
  taxes: number;
  deductions: number;
  netPay: number;
  status: PayrollStatus;
}

const payrollRuns: PayrollRun[] = [
  {
    id: "1",
    period: "Jun 1-15, 2024",
    payDate: "2024-06-20",
    employeeCount: 45,
    grossPay: 185000,
    taxes: 42550,
    deductions: 12350,
    netPay: 130100,
    status: PAYROLL_STATUS.COMPLETED,
  },
  {
    id: "2",
    period: "Jun 16-30, 2024",
    payDate: "2024-07-05",
    employeeCount: 48,
    grossPay: 195000,
    taxes: 44850,
    deductions: 13100,
    netPay: 137050,
    status: PAYROLL_STATUS.PENDING,
  },
  {
    id: "3",
    period: "May 16-31, 2024",
    payDate: "2024-06-05",
    employeeCount: 42,
    grossPay: 175000,
    taxes: 40250,
    deductions: 11800,
    netPay: 122950,
    status: PAYROLL_STATUS.COMPLETED,
  },
  {
    id: "4",
    period: "May 1-15, 2024",
    payDate: "2024-05-20",
    employeeCount: 42,
    grossPay: 172000,
    taxes: 39560,
    deductions: 11500,
    netPay: 120940,
    status: PAYROLL_STATUS.COMPLETED,
  },
];

const statusConfig: Record<PayrollStatus, { label: string; color: string; icon: React.ElementType }> = {
  [PAYROLL_STATUS.DRAFT]: { label: "Draft", color: "bg-gray-500", icon: Clock },
  [PAYROLL_STATUS.PENDING]: { label: "Pending", color: "bg-yellow-500", icon: Clock },
  [PAYROLL_STATUS.PROCESSING]: { label: "Processing", color: "bg-blue-500", icon: Clock },
  [PAYROLL_STATUS.COMPLETED]: { label: "Completed", color: "bg-green-500", icon: CheckCircle },
  [PAYROLL_STATUS.FAILED]: { label: "Failed", color: "bg-red-500", icon: Clock },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return formatCurrencyUtil(amount, DEFAULT_CURRENCY);
}

export default function PayrollPage() {
  const totalGrossPay = payrollRuns.reduce((acc, p) => acc + p.grossPay, 0);
  const totalNetPay = payrollRuns.reduce((acc, p) => acc + p.netPay, 0);
  const totalTaxes = payrollRuns.reduce((acc, p) => acc + p.taxes, 0);
  const pendingRuns = payrollRuns.filter((p) => p.status === PAYROLL_STATUS.PENDING).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll"
        description="Manage payroll runs and employee payments"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Payroll Run
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="YTD Gross Pay"
          value={formatCurrency(totalGrossPay)}
          icon={DollarSign}
        />
        <StatCard
          title="YTD Net Pay"
          value={formatCurrency(totalNetPay)}
          valueClassName="text-green-500"
          icon={CheckCircle}
        />
        <StatCard
          title="YTD Taxes"
          value={formatCurrency(totalTaxes)}
          valueClassName="text-orange-500"
          icon={Receipt}
        />
        <StatCard
          title="Pending Runs"
          value={pendingRuns}
          valueClassName="text-yellow-500"
          icon={Clock}
        />
      </StatGrid>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search payroll runs..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Runs</CardTitle>
          <CardDescription>Recent and upcoming payroll periods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payrollRuns.map((run) => {
              const status = statusConfig[run.status];
              const StatusIcon = status.icon;

              return (
                <div key={run.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-muted">
                        <DollarSign className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{run.period}</h4>
                          <Badge className={`${status.color} text-white`}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {status.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Pay Date: {formatDate(run.payDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {run.employeeCount} employees
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-bold">{formatCurrency(run.netPay)}</p>
                        <p className="text-xs text-muted-foreground">Net Pay</p>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>View Employees</DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download Report
                          </DropdownMenuItem>
                          {run.status === PAYROLL_STATUS.PENDING && (
                            <>
                              <DropdownMenuItem>Edit Run</DropdownMenuItem>
                              <DropdownMenuItem className="text-green-600">Process Payroll</DropdownMenuItem>
                            </>
                          )}
                          {run.status === PAYROLL_STATUS.COMPLETED && (
                            <DropdownMenuItem>View Pay Stubs</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Gross Pay</p>
                      <p className="font-medium">{formatCurrency(run.grossPay)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Taxes</p>
                      <p className="font-medium text-orange-500">{formatCurrency(run.taxes)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Deductions</p>
                      <p className="font-medium">{formatCurrency(run.deductions)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Net Pay</p>
                      <p className="font-medium text-green-500">{formatCurrency(run.netPay)}</p>
                    </div>
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
