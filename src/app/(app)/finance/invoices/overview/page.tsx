"use client";

import { useMemo } from "react";
import { StatCard, StatGrid } from "@/components/common/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { PageShell } from "@/components/common/page-shell";
import { ContextualEmptyState } from "@/components/common/contextual-empty-state";
import { cn, formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useUser, useSupabase } from "@/hooks/auth/use-supabase";
import { useQuery } from "@tanstack/react-query";

interface InvoiceSummary {
  id: string;
  invoice_number: string;
  status: string;
  amount: number;
  due_date: string | null;
  issue_date: string | null;
  company_name: string | null;
  days_overdue: number;
}

function useInvoiceOverview() {
  const supabase = useSupabase();
  const { user } = useUser();
  const organizationId = user?.user_metadata?.organization_id;

  return useQuery({
    queryKey: ["invoice-overview", organizationId],
    queryFn: async () => {
      if (!organizationId) return null;

      const { data: invoices, error } = await supabase
        .from("invoices")
        .select(`
          id, invoice_number, status, total_amount, due_date, issue_date,
          company:companies(name)
        `)
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const now = new Date();
      const mapped: InvoiceSummary[] = (invoices ?? []).map((inv) => {
        const dueDate = inv.due_date ? new Date(inv.due_date) : null;
        const statusVal = inv.status ?? "draft";
        const daysOverdue = dueDate && dueDate < now && statusVal !== "paid"
          ? Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
          : 0;
        const company = inv.company as { name: string } | null;

        return {
          id: inv.id,
          invoice_number: inv.invoice_number ?? "",
          status: statusVal,
          amount: inv.total_amount ?? 0,
          due_date: inv.due_date,
          issue_date: inv.issue_date,
          company_name: company?.name ?? null,
          days_overdue: daysOverdue,
        };
      });

      return mapped;
    },
    enabled: !!organizationId,
  });
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  draft: { label: "Draft", color: "text-muted-foreground", bgColor: "bg-muted" },
  sent: { label: "Sent", color: "text-semantic-info", bgColor: "bg-semantic-info/10" },
  paid: { label: "Paid", color: "text-semantic-success", bgColor: "bg-semantic-success/10" },
  overdue: { label: "Overdue", color: "text-destructive", bgColor: "bg-destructive/10" },
  partially_paid: { label: "Partial", color: "text-semantic-warning", bgColor: "bg-semantic-warning/10" },
};

export default function InvoiceOverviewPage() {
  const { data: invoices, isLoading } = useInvoiceOverview();

  const stats = useMemo(() => {
    if (!invoices) return null;

    const totalOutstanding = invoices
      .filter((i) => i.status !== "paid" && i.status !== "draft")
      .reduce((sum, i) => sum + i.amount, 0);

    const totalOverdue = invoices
      .filter((i) => i.days_overdue > 0)
      .reduce((sum, i) => sum + i.amount, 0);

    const totalPaid = invoices
      .filter((i) => i.status === "paid")
      .reduce((sum, i) => sum + i.amount, 0);

    const totalDraft = invoices
      .filter((i) => i.status === "draft")
      .reduce((sum, i) => sum + i.amount, 0);

    const overdueCount = invoices.filter((i) => i.days_overdue > 0).length;

    // Aging buckets
    const aging = {
      current: invoices.filter((i) => i.status !== "paid" && i.status !== "draft" && i.days_overdue === 0),
      "1-30": invoices.filter((i) => i.days_overdue > 0 && i.days_overdue <= 30),
      "31-60": invoices.filter((i) => i.days_overdue > 30 && i.days_overdue <= 60),
      "61-90": invoices.filter((i) => i.days_overdue > 60 && i.days_overdue <= 90),
      "90+": invoices.filter((i) => i.days_overdue > 90),
    };

    const collectionRate = totalPaid + totalOutstanding > 0
      ? Math.round((totalPaid / (totalPaid + totalOutstanding)) * 100)
      : 0;

    return {
      totalOutstanding,
      totalOverdue,
      totalPaid,
      totalDraft,
      overdueCount,
      aging,
      collectionRate,
      total: invoices.length,
    };
  }, [invoices]);

  const recentInvoices = useMemo(() => {
    if (!invoices) return [];
    return invoices.slice(0, 10);
  }, [invoices]);

  const fmt = (n: number) => formatCurrency(n);
  const headerActions = (
    <Link href="/finance/invoices">
      <Button variant="outline" size="sm">
        <FileText className="h-4 w-4 mr-2" />
        All Invoices
      </Button>
    </Link>
  );

  if (isLoading) {
    return (
      <PageShell
        title="Invoice Overview"
        description="Financial summary and aging analysis"
        actions={headerActions}
        contentClassName="space-y-6"
      >
        <div>
          <Skeleton className="h-8 w-60" />
          <Skeleton className="h-4 w-40 mt-2" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Invoice Overview"
      description="Financial summary and aging analysis"
      actions={headerActions}
      contentClassName="space-y-6"
    >
      {/* KPI Stats */}
      <StatGrid columns={4}>
        <StatCard
          title="Outstanding"
          value={fmt(stats?.totalOutstanding ?? 0)}
          icon={DollarSign}
        />
        <StatCard
          title="Overdue"
          value={fmt(stats?.totalOverdue ?? 0)}
          icon={AlertTriangle}
          trend={
            stats?.overdueCount
              ? { value: stats.overdueCount, isPositive: false }
              : undefined
          }
        />
        <StatCard
          title="Collected"
          value={fmt(stats?.totalPaid ?? 0)}
          icon={CheckCircle2}
        />
        <StatCard
          title="Collection Rate"
          value={`${stats?.collectionRate ?? 0}%`}
          icon={TrendingUp}
          trend={
            stats?.collectionRate
              ? { value: stats.collectionRate, isPositive: stats.collectionRate >= 80 }
              : undefined
          }
        />
      </StatGrid>

      <div className="grid grid-cols-12 gap-6">
        {/* Aging Breakdown */}
        <Card className="col-span-5 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-black uppercase tracking-[0.15em] opacity-70">
              <Clock className="h-4 w-4 inline mr-2" />
              Aging Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { key: "current", label: "Current", color: "bg-semantic-success" },
              { key: "1-30", label: "1–30 days", color: "bg-semantic-warning" },
              { key: "31-60", label: "31–60 days", color: "bg-semantic-orange" },
              { key: "61-90", label: "61–90 days", color: "bg-destructive/70" },
              { key: "90+", label: "90+ days", color: "bg-destructive" },
            ].map((bucket) => {
              const items = stats?.aging?.[bucket.key as keyof typeof stats.aging] ?? [];
              const amount = items.reduce((s, i) => s + i.amount, 0);
              const pct = stats?.totalOutstanding
                ? Math.round((amount / stats.totalOutstanding) * 100)
                : 0;

              return (
                <div key={bucket.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold">{bucket.label}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px] font-mono">
                        {items.length}
                      </Badge>
                      <span className="font-mono font-bold">{fmt(amount)}</span>
                    </div>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card className="col-span-7 border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-black uppercase tracking-[0.15em] opacity-70">
                <FileText className="h-4 w-4 inline mr-2" />
                Recent Invoices
              </CardTitle>
              <Link href="/finance/invoices">
                <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest">
                  View All <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentInvoices.length === 0 ? (
                <div className="px-6 py-4">
                  <ContextualEmptyState
                    type="no-data"
                    title="No invoices yet"
                    description="Create an invoice to start tracking receivables."
                    className="py-6"
                  />
                </div>
              ) : (
                recentInvoices.map((inv) => {
                  const cfg = STATUS_CONFIG[inv.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.draft;
                  if (!cfg) return null;
                  return (
                    <Link
                      key={inv.id}
                      href={`/finance/invoices/${inv.id}`}
                      className="flex items-center justify-between px-6 py-3 hover:bg-accent/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", cfg.bgColor)}>
                          <FileText className={cn("h-4 w-4", cfg.color)} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">
                            #{inv.invoice_number || inv.id.slice(0, 8)}
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {inv.company_name || "—"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-sm font-bold">{fmt(inv.amount)}</span>
                        <Badge className={cn("text-[9px] font-black uppercase", cfg.bgColor, cfg.color)}>
                          {cfg.label}
                        </Badge>
                        {inv.days_overdue > 0 && (
                          <Badge variant="destructive" className="text-[9px]">
                            {inv.days_overdue}d late
                          </Badge>
                        )}
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Draft Pipeline */}
      {stats && stats.totalDraft > 0 && (
        <Card className="border-border border-dashed">
          <CardContent className="py-4 px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Draft Invoices</p>
                  <p className="text-[10px] text-muted-foreground">
                    {invoices?.filter((i) => i.status === "draft").length} invoices totaling{" "}
                    {fmt(stats.totalDraft)} ready to send
                  </p>
                </div>
              </div>
              <Link href="/finance/invoices?status=draft">
                <Button variant="outline" size="sm" className="text-[10px] font-bold uppercase tracking-widest">
                  Review Drafts
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </PageShell>
  );
}
