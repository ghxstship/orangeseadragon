'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Download,
  Calendar,
  Package,
  DollarSign
} from 'lucide-react';

interface AssetUtilization {
  asset_id: string;
  asset_name: string;
  asset_type: string;
  category: string;
  days_reserved: number;
  days_deployed: number;
  days_maintenance: number;
  days_available: number;
  utilization_rate: number;
  revenue_generated: number;
  maintenance_cost: number;
  net_contribution: number;
}

interface CategoryUtilization {
  category: string;
  total_assets: number;
  average_utilization: number;
  total_revenue: number;
  total_maintenance_cost: number;
}

interface UtilizationHeatmapData {
  day: string;
  utilization: number;
}

interface AssetUtilizationDashboardProps {
  assets?: AssetUtilization[];
  dateRange?: { start: Date; end: Date };
  onExport?: () => void;
}

const EMPTY_HEATMAP: UtilizationHeatmapData[] = [
  { day: 'Mon', utilization: 0 },
  { day: 'Tue', utilization: 0 },
  { day: 'Wed', utilization: 0 },
  { day: 'Thu', utilization: 0 },
  { day: 'Fri', utilization: 0 },
  { day: 'Sat', utilization: 0 },
  { day: 'Sun', utilization: 0 },
];

export function AssetUtilizationDashboard({ 
  assets = [],
  onExport 
}: AssetUtilizationDashboardProps) {
  const [period, setPeriod] = useState<string>('30');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredAssets = useMemo(() => {
    if (categoryFilter === 'all') return assets;
    return assets.filter(a => a.category === categoryFilter);
  }, [assets, categoryFilter]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(assets.map(a => a.category)));
    return cats;
  }, [assets]);

  const categoryUtilization = useMemo((): CategoryUtilization[] => {
    const grouped = assets.reduce((acc, asset) => {
      if (!acc[asset.category]) {
        acc[asset.category] = {
          category: asset.category,
          total_assets: 0,
          total_utilization: 0,
          total_revenue: 0,
          total_maintenance_cost: 0,
        };
      }
      acc[asset.category]!.total_assets += 1;
      acc[asset.category]!.total_utilization += asset.utilization_rate;
      acc[asset.category]!.total_revenue += asset.revenue_generated;
      acc[asset.category]!.total_maintenance_cost += asset.maintenance_cost;
      return acc;
    }, {} as Record<string, { category: string; total_assets: number; total_utilization: number; total_revenue: number; total_maintenance_cost: number }>);

    return Object.values(grouped).map(g => ({
      category: g.category,
      total_assets: g.total_assets,
      average_utilization: Math.round(g.total_utilization / g.total_assets),
      total_revenue: g.total_revenue,
      total_maintenance_cost: g.total_maintenance_cost,
    }));
  }, [assets]);

  const underutilizedAssets = useMemo(() => {
    return filteredAssets.filter(a => a.utilization_rate < 20).sort((a, b) => a.utilization_rate - b.utilization_rate);
  }, [filteredAssets]);

  const overallStats = useMemo(() => {
    const totalAssets = filteredAssets.length;
    const avgUtilization = totalAssets > 0 
      ? Math.round(filteredAssets.reduce((sum, a) => sum + a.utilization_rate, 0) / totalAssets)
      : 0;
    const totalRevenue = filteredAssets.reduce((sum, a) => sum + a.revenue_generated, 0);
    const totalMaintenance = filteredAssets.reduce((sum, a) => sum + a.maintenance_cost, 0);
    
    return { totalAssets, avgUtilization, totalRevenue, totalMaintenance };
  }, [filteredAssets]);

  const getUtilizationColor = (rate: number): string => {
    if (rate >= 80) return 'bg-semantic-success';
    if (rate >= 50) return 'bg-semantic-warning';
    if (rate >= 20) return 'bg-semantic-orange';
    return 'bg-destructive';
  };

  const getHeatmapOpacityClass = (rate: number): string => {
    if (rate >= 90) return 'opacity-90';
    if (rate >= 80) return 'opacity-80';
    if (rate >= 70) return 'opacity-70';
    if (rate >= 60) return 'opacity-60';
    if (rate >= 50) return 'opacity-50';
    if (rate >= 40) return 'opacity-40';
    if (rate >= 30) return 'opacity-30';
    if (rate >= 20) return 'opacity-20';
    if (rate >= 10) return 'opacity-10';
    return 'opacity-0';
  };

  const getUtilizationBadge = (rate: number) => {
    if (rate >= 80) return <Badge variant="default" className="bg-semantic-success">High</Badge>;
    if (rate >= 50) return <Badge variant="default" className="bg-semantic-warning">Medium</Badge>;
    if (rate >= 20) return <Badge variant="default" className="bg-semantic-orange">Low</Badge>;
    return <Badge variant="destructive">Critical</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Asset Utilization</h2>
          <p className="text-muted-foreground">Track asset usage and identify optimization opportunities</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]">
              <Package className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={onExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Utilization</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.avgUtilization}%</div>
            <Progress value={overallStats.avgUtilization} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalAssets}</div>
            <p className="text-xs text-muted-foreground">
              {underutilizedAssets.length} underutilized
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overallStats.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-semantic-success">
              <TrendingUp className="mr-1 h-3 w-3" />
              +12% from last period
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Cost</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overallStats.totalMaintenance.toLocaleString()}</div>
            <div className="flex items-center text-xs text-destructive">
              <TrendingDown className="mr-1 h-3 w-3" />
              -5% from last period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Utilization */}
      <Card>
        <CardHeader>
          <CardTitle>Utilization by Category</CardTitle>
          <CardDescription>Average utilization rate across asset categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {categoryUtilization.map(cat => (
              <div key={cat.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{cat.category}</span>
                  <span className="text-sm text-muted-foreground">{cat.average_utilization}%</span>
                </div>
                <Progress value={cat.average_utilization} className={getUtilizationColor(cat.average_utilization)} />
                <p className="text-xs text-muted-foreground">{cat.total_assets} assets</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Utilization Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Utilization Pattern</CardTitle>
          <CardDescription>Average utilization by day of week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {EMPTY_HEATMAP.map(day => (
              <div key={day.day} className="flex-1 text-center">
                <div 
                  className={`h-12 rounded ${getUtilizationColor(day.utilization)} ${getHeatmapOpacityClass(day.utilization)}`}
                />
                <p className="mt-2 text-xs font-medium">{day.day}</p>
                <p className="text-xs text-muted-foreground">{day.utilization}%</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Underutilized Assets Alert */}
      {underutilizedAssets.length > 0 && (
        <Card className="border-semantic-warning/30 bg-semantic-warning/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-semantic-warning" />
              <CardTitle className="text-semantic-warning">Underutilized Assets (&lt;20%)</CardTitle>
            </div>
            <CardDescription className="text-semantic-warning/90">
              Consider reviewing these assets for potential sale, rental, or reallocation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {underutilizedAssets.map(asset => (
                <div key={asset.asset_id} className="flex items-center justify-between rounded-lg bg-card p-3">
                  <div>
                    <p className="font-medium">{asset.asset_name}</p>
                    <p className="text-sm text-muted-foreground">{asset.category}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{asset.utilization_rate}%</p>
                      <p className="text-xs text-muted-foreground">utilization</p>
                    </div>
                    {getUtilizationBadge(asset.utilization_rate)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Asset Detail Table */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Performance Details</CardTitle>
          <CardDescription>Detailed utilization metrics for each asset</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Asset</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium text-right">Utilization</th>
                  <th className="pb-3 font-medium text-right">Days Deployed</th>
                  <th className="pb-3 font-medium text-right">Revenue</th>
                  <th className="pb-3 font-medium text-right">Maintenance</th>
                  <th className="pb-3 font-medium text-right">Net Contribution</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map(asset => (
                  <tr key={asset.asset_id} className="border-b">
                    <td className="py-3">
                      <p className="font-medium">{asset.asset_name}</p>
                    </td>
                    <td className="py-3 text-muted-foreground">{asset.category}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Progress value={asset.utilization_rate} className="w-16" />
                        <span className="w-10 text-sm">{asset.utilization_rate}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-right">{asset.days_deployed}</td>
                    <td className="py-3 text-right text-semantic-success">${asset.revenue_generated.toLocaleString()}</td>
                    <td className="py-3 text-right text-destructive">${asset.maintenance_cost.toLocaleString()}</td>
                    <td className="py-3 text-right font-medium">${asset.net_contribution.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AssetUtilizationDashboard;
