"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Calendar, Download, Loader2 } from "lucide-react";

interface PayrollPeriod {
  id: string;
  period: string;
  status: string;
  total_amount: string;
  employees: number;
}

export default function JobsPayrollPage() {
  const [payrollPeriods, setPayrollPeriods] = React.useState<PayrollPeriod[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchPayroll() {
      try {
        const response = await fetch("/api/v1/business/jobs/payroll");
        if (response.ok) {
          const result = await response.json();
          setPayrollPeriods(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch payroll:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPayroll();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold tracking-tight">Payroll</h1><p className="text-muted-foreground">Payroll management</p></div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Current Period</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">$46,500</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Employees</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">25</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">YTD Total</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">$540K</div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" />Payroll Periods</CardTitle><CardDescription>Recent payroll runs</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payrollPeriods.map((period) => (
              <div key={period.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2"><h4 className="font-medium flex items-center gap-1"><Calendar className="h-4 w-4" />{period.period}</h4><Badge variant={period.status === "processed" ? "default" : "secondary"}>{period.status}</Badge></div>
                  <p className="text-sm text-muted-foreground mt-1">{period.employees} employees • {period.total_amount}</p>
                </div>
                <Button variant="outline" size="sm"><Download className="h-3 w-3 mr-2" />Report</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
