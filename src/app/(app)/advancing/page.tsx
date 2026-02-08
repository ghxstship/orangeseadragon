'use client';

import { useEffect, useState, useCallback } from 'react';
import { StatCard, StatGrid } from '@/components/common/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, CheckCircle2, TrendingUp, QrCode, AlertCircle, RefreshCw } from 'lucide-react';
import { ScannerModal, ConflictPanel, ConflictBadge } from '@/components/modules/advancing';

interface DashboardMetrics {
  totalAdvances: number;
  totalItems: number;
  completedItems: number;
  criticalPending: number;
  totalBudget: number;
  confirmedBudget: number;
}

interface CriticalItem {
  id: string;
  item_name: string;
  status: string;
  scheduled_delivery: string;
  location: string;
  vendor?: { id: string; name: string };
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

export default function AdvancingDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [criticalItems, setCriticalItems] = useState<CriticalItem[]>([]);
  const [upcomingDeliveries, setUpcomingDeliveries] = useState<CriticalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [conflictPanelOpen, setConflictPanelOpen] = useState(false);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [conflictsLoading, setConflictsLoading] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/advancing/dashboard');
      const data = await res.json();
      setMetrics(data.metrics);
      setCriticalItems(data.criticalItems || []);
      setUpcomingDeliveries(data.upcomingDeliveries || []);
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

  const completionRate = metrics ? Math.round((metrics.completedItems / Math.max(metrics.totalItems, 1)) * 100) : 0;
  const budgetConfirmedRate = metrics ? Math.round((metrics.confirmedBudget / Math.max(metrics.totalBudget, 1)) * 100) : 0;

  const blockingConflicts = conflicts.filter(c => c.severity === 'blocking');

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Advancing</h1>
              <p className="text-muted-foreground">Production advance coordination</p>
            </div>
            {blockingConflicts.length > 0 && (
              <ConflictBadge
                count={blockingConflicts.length}
                severity="blocking"
                onClick={() => setConflictPanelOpen(true)}
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setConflictPanelOpen(true)}>
              <AlertCircle className="h-4 w-4 mr-2" />
              Conflicts
              {conflicts.length > 0 && (
                <Badge variant="secondary" className="ml-2">{conflicts.length}</Badge>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setScannerOpen(true)}>
              <QrCode className="h-4 w-4 mr-2" />
              Scan
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { fetchDashboard(); fetchConflicts(); }}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <StatGrid columns={4}>
          <StatCard title="Total Items" value={String(metrics?.totalItems || 0)} icon={CheckCircle2} />
          <StatCard title="Completed" value={`${completionRate}%`} icon={TrendingUp} description={`${metrics?.completedItems || 0} items done`} />
          <StatCard title="Critical Pending" value={String(metrics?.criticalPending || 0)} icon={AlertTriangle} />
          <StatCard title="Budget Confirmed" value={`${budgetConfirmedRate}%`} icon={TrendingUp} />
        </StatGrid>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-lg">Critical Path Items</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-muted-foreground">Loading...</div>
              ) : criticalItems.length === 0 ? (
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>No critical items pending</span>
                </div>
              ) : (
                <ul className="space-y-3">
                  {criticalItems.map((item) => (
                    <li key={item.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <div className="font-medium">{item.item_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.vendor?.name || 'No vendor'} • {item.location || 'TBD'}
                        </div>
                      </div>
                      <Badge variant={item.status === 'pending' ? 'secondary' : 'outline'}>
                        {item.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Upcoming Deliveries (48h)</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-muted-foreground">Loading...</div>
              ) : upcomingDeliveries.length === 0 ? (
                <div className="text-muted-foreground">No deliveries in next 48 hours</div>
              ) : (
                <ul className="space-y-3">
                  {upcomingDeliveries.map((item) => (
                    <li key={item.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <div className="font-medium">{item.item_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.vendor?.name || 'No vendor'}
                        </div>
                      </div>
                      <div className="text-sm text-right">
                        <div className="font-medium">
                          {new Date(item.scheduled_delivery).toLocaleDateString()}
                        </div>
                        <div className="text-muted-foreground">
                          {new Date(item.scheduled_delivery).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

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
                  <div className="text-2xl font-bold">${(metrics.totalBudget / 1000).toFixed(1)}K</div>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-1">Confirmed</div>
                  <div className="text-2xl font-bold text-primary">${(metrics.confirmedBudget / 1000).toFixed(1)}K</div>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-1">Pending</div>
                  <div className="text-2xl font-bold text-warning">
                    ${((metrics.totalBudget - metrics.confirmedBudget) / 1000).toFixed(1)}K
                  </div>
                </div>
              </div>
              <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${budgetConfirmedRate}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

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
    </div>
  );
}
