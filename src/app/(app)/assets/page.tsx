'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/common/page-shell';
import { StatCard, StatGrid } from '@/components/common/stat-card';
import { StaggerList, StaggerItem } from '@/components/ui/motion';
import { useCopilotContext } from '@/hooks/ui/use-copilot-context';
import {
  Package,
  CheckCircle,
  Truck,
  Wrench,
  BookOpen,
  Boxes,
  MapPin,
  CalendarCheck,
  ChevronRight,
  RefreshCw,
  Activity,
  BarChart3,
} from 'lucide-react';

interface NavCardProps {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
}

function NavCard({ href, icon: Icon, title, description }: NavCardProps) {
  return (
    <Link href={href}>
      <Card className="group cursor-pointer hover:bg-accent/50 transition-all border-border h-full">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors shrink-0">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>
          </div>
          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-40 transition-opacity shrink-0" />
        </CardContent>
      </Card>
    </Link>
  );
}

export default function AssetsPage() {
  const router = useRouter();
  useCopilotContext({ module: 'assets' });

  const [stats, setStats] = React.useState({ totalAssets: 0, available: 0, deployed: 0, inMaintenance: 0 });
  const [statsLoading, setStatsLoading] = React.useState(true);

  const fetchStats = React.useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch('/api/assets/stats');
      if (res.ok) {
        const json = await res.json();
        setStats(json.data);
      }
    } catch { /* use defaults */ }
    setStatsLoading(false);
  }, []);

  React.useEffect(() => { fetchStats(); }, [fetchStats]);

  const utilization = stats.totalAssets > 0 ? Math.round(((stats.totalAssets - stats.available) / stats.totalAssets) * 100) : 0;

  return (
    <PageShell
      title="Assets"
      description="Equipment & logistics management"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchStats}>
            <RefreshCw className={`h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => router.push('/assets/catalog')}>
            <BookOpen className="h-4 w-4 mr-2" />
            Catalog
          </Button>
        </div>
      }
      contentClassName="space-y-8"
    >
        <StatGrid columns={4}>
          <StatCard title="Total Assets" value={statsLoading ? '…' : String(stats.totalAssets)} icon={Package} />
          <StatCard title="Available" value={statsLoading ? '…' : String(stats.available)} icon={CheckCircle} description={`${utilization}% utilization`} />
          <StatCard title="Deployed" value={statsLoading ? '…' : String(stats.deployed)} icon={Truck} />
          <StatCard title="In Maintenance" value={statsLoading ? '…' : String(stats.inMaintenance)} icon={Wrench} trend={stats.inMaintenance > 0 ? { value: stats.inMaintenance, isPositive: false } : undefined} />
        </StatGrid>

        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-4">Quick Access</h2>
          <StaggerList className="grid gap-3 md:grid-cols-3">
            <StaggerItem><NavCard href="/assets/catalog" icon={BookOpen} title="Catalog" description="Equipment catalog (Uline-style SSOT)" /></StaggerItem>
            <StaggerItem><NavCard href="/assets/inventory" icon={Boxes} title="Inventory" description="Physical asset instances" /></StaggerItem>
            <StaggerItem><NavCard href="/assets/locations" icon={MapPin} title="Locations" description="Warehouses, bins & staging areas" /></StaggerItem>
            <StaggerItem><NavCard href="/assets/reservations" icon={CalendarCheck} title="Reservations" description="Book and track equipment" /></StaggerItem>
            <StaggerItem><NavCard href="/assets/maintenance" icon={Wrench} title="Maintenance" description="Repairs and scheduled service" /></StaggerItem>
            <StaggerItem><NavCard href="/assets/logistics" icon={Truck} title="Logistics" description="Shipments, vehicles & deployment" /></StaggerItem>
            <StaggerItem><NavCard href="/assets/status" icon={Activity} title="Status" description="Real-time asset tracking" /></StaggerItem>
            <StaggerItem><NavCard href="/assets/deployment" icon={Package} title="Deployment" description="Deploy assets to events" /></StaggerItem>
            <StaggerItem><NavCard href="/assets/advances" icon={BarChart3} title="Reports" description="Asset utilization analytics" /></StaggerItem>
          </StaggerList>
        </div>
    </PageShell>
  );
}
