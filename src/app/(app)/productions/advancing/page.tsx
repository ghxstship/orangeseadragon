'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PageShell } from '@/components/common/page-shell';
import { StatCard, StatGrid } from '@/components/common/stat-card';
import { formatCurrency } from '@/lib/utils';
import {
  ClipboardList,
  Layers,
  ShieldCheck,
  Link2,
  Activity,
  ArrowRight,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  QrCode,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { ScannerModal, ConflictPanel, ConflictBadge } from '@/components/modules/advancing';

interface DashboardMetrics {
  totalAdvances: number;
  totalItems: number;
  completedItems: number;
  criticalPending: number;
  totalBudget: number;
  confirmedBudget: number;
  pendingApprovals: number;
  activeAssignments: number;
}

interface Conflict {
  id: string;
  conflict_type: string;
  severity: 'warning' | 'blocking';
  status: 'open' | 'resolved' | 'ignored';
  description: string;
  entity_type: string;
  entity_id: string;
  conflicting_entity_id?: string;
  conflict_start?: string;
  conflict_end?: string;
  suggested_resolutions?: Array<{ action: string; label: string }>;
  detected_at: string;
}

const subPages = [
  {
    id: 'advances',
    title: 'Advances',
    description: 'Production advance requests by event — create, submit & track',
    href: '/productions/advancing/advances',
    icon: ClipboardList,
  },
  {
    id: 'allotments',
    title: 'Allotments',
    description: 'Allocate advance items by category, quantity & budget',
    href: '/productions/advancing/allotments',
    icon: Layers,
  },
  {
    id: 'approvals',
    title: 'Approvals',
    description: 'Review and approve pending advance requests',
    href: '/productions/advancing/approvals',
    icon: ShieldCheck,
  },
  {
    id: 'assignments',
    title: 'Assignments',
    description: 'Link inventory items to users, teams & companies',
    href: '/productions/advancing/assignments',
    icon: Link2,
  },
  {
    id: 'activity',
    title: 'Activity',
    description: 'Full advance lifecycle audit trail & event log',
    href: '/productions/advancing/activity',
    icon: Activity,
  },
] as const;

export default function AdvancingHubPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [_loading, setLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [conflictPanelOpen, setConflictPanelOpen] = useState(false);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [conflictsLoading, setConflictsLoading] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/advancing/dashboard');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics ?? data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConflicts = useCallback(async () => {
    setConflictsLoading(true);
    try {
      const res = await fetch('/api/advancing/conflicts?status=open');
      if (res.ok) {
        const data = await res.json();
        setConflicts(data.records || []);
      }
    } catch (error) {
      console.error('Failed to fetch conflicts:', error);
    } finally {
      setConflictsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchConflicts();
  }, [fetchDashboard, fetchConflicts]);

  const completionRate = metrics
    ? Math.round((metrics.completedItems / Math.max(metrics.totalItems, 1)) * 100)
    : 0;
  const budgetConfirmedRate = metrics
    ? Math.round((metrics.confirmedBudget / Math.max(metrics.totalBudget, 1)) * 100)
    : 0;
  const blockingConflicts = conflicts.filter((c) => c.severity === 'blocking');

  return (
    <>
      <PageShell
        title="Advancing"
        description="Production advance coordination & logistics"
        actions={
          <div className="flex items-center gap-2">
            {blockingConflicts.length > 0 && (
              <ConflictBadge
                count={blockingConflicts.length}
                severity="blocking"
                onClick={() => setConflictPanelOpen(true)}
              />
            )}
            <Button variant="outline" size="sm" onClick={() => setConflictPanelOpen(true)}>
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Conflicts</span>
              {conflicts.length > 0 && (
                <Badge variant="secondary" className="ml-2">{conflicts.length}</Badge>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setScannerOpen(true)}>
              <QrCode className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Scan</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { fetchDashboard(); fetchConflicts(); }}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        }
        contentClassName="space-y-6"
      >
        {/* KPI Stats */}
        <StatGrid columns={4}>
          <StatCard title="Total Advances" value={String(metrics?.totalAdvances || 0)} icon={ClipboardList} />
          <StatCard title="Completion" value={`${completionRate}%`} icon={TrendingUp} description={`${metrics?.completedItems || 0} of ${metrics?.totalItems || 0} items`} />
          <StatCard title="Critical Pending" value={String(metrics?.criticalPending || 0)} icon={AlertTriangle} />
          <StatCard title="Budget Confirmed" value={`${budgetConfirmedRate}%`} icon={CheckCircle2} />
        </StatGrid>

        {/* Sub-page Navigation Cards */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-4">Advance Management</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subPages.map((page) => {
              const Icon = page.icon;
              return (
                <Link key={page.id} href={page.href}>
                  <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-base font-semibold flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted border text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-colors">
                          <Icon className="w-5 h-5" />
                        </div>
                        {page.title}
                      </CardTitle>
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{page.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Budget Overview */}
        {metrics && metrics.totalBudget > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Budget Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-1">Total Budget</div>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.totalBudget)}</div>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-1">Confirmed</div>
                  <div className="text-2xl font-bold text-primary">{formatCurrency(metrics.confirmedBudget)}</div>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-1">Pending</div>
                  <div className="text-2xl font-bold text-warning">
                    {formatCurrency(metrics.totalBudget - metrics.confirmedBudget)}
                  </div>
                </div>
              </div>
              <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                <Progress value={budgetConfirmedRate} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pre-production Readiness (riders/catering/etc.) */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-4">Pre-Production Readiness</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Tech Riders', href: '/productions/advancing/riders', icon: '📋' },
              { title: 'Catering & Hospitality', href: '/productions/advancing/catering', icon: '🍽️' },
              { title: 'Guest Lists', href: '/productions/advancing/guest-lists', icon: '👥' },
              { title: 'Travel & Hotels', href: '/productions/advancing/hospitality', icon: '🏨' },
              { title: 'Stage Plots', href: '/productions/advancing/tech-specs', icon: '🎛️' },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer group">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium text-sm">{item.title}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </PageShell>

      <ScannerModal
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScanComplete={() => { fetchDashboard(); }}
      />

      <ConflictPanel
        open={conflictPanelOpen}
        onOpenChange={setConflictPanelOpen}
        conflicts={conflicts}
        onRefresh={fetchConflicts}
        loading={conflictsLoading}
      />
    </>
  );
}
