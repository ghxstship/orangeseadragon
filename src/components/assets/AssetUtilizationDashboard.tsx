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

const MOCK_ASSETS: AssetUtilization[] = [
  { asset_id: '1', asset_name: 'LED Par Can #1247', asset_type: 'equipment', category: 'Lighting', days_reserved: 22, days_deployed: 20, days_maintenance: 2, days_available: 6, utilization_rate: 78, revenue_generated: 4400, maintenance_cost: 150, net_contribution: 4250 },
  { asset_id: '2', asset_name: 'Truss Section A-12', asset_type: 'equipment', category: 'Staging', days_reserved: 4, days_deployed: 3, days_maintenance: 0, days_available: 27, utilization_rate: 12, revenue_generated: 600, maintenance_cost: 0, net_contribution: 600 },
  { asset_id: '3', asset_name: 'QSC K12.2 Speaker', asset_type: 'equipment', category: 'Audio', days_reserved: 14, days_deployed: 12, days_maintenance: 1, days_available: 15, utilization_rate: 45, revenue_generated: 2100, maintenance_cost: 75, net_contribution: 2025 },
  { asset_id: '4', asset_name: 'PTZ Camera #3', asset_type: 'equipment', category: 'Video', days_reserved: 28, days_deployed: 26, days_maintenance: 2, days_available: 0, utilization_rate: 92, revenue_generated: 5600, maintenance_cost: 200, net_contribution: 5400 },
  { asset_id: '5', asset_name: 'Fog Machine #7', asset_type: 'equipment', category: 'Effects', days_reserved: 4, days_deployed: 3, days_maintenance: 0, days_available: 27, utilization_rate: 12, revenue_generated: 300, maintenance_cost: 0, net_contribution: 300 },
];

const MOCK_HEATMAP: UtilizationHeatmapData[] = [
  { day: 'Mon', utilization: 45 },
  { day: 'Tue', utilization: 62 },
  { day: 'Wed', utilization: 78 },
  { day: 'Thu', utilization: 85 },
  { day: 'Fri', utilization: 95 },
  { day: 'Sat', utilization: 98 },
  { day: 'Sun', utilization: 32 },
];

export function AssetUtilizationDashboard({ 
  assets = MOCK_ASSETS,
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
      acc[asset.category].total_assets += 1;
      acc[asset.category].total_utilization += asset.utilization_rate;
      acc[asset.category].total_revenue += asset.revenue_generated;
      acc[asset.category].total_maintenance_cost += asset.maintenance_cost;
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
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 50) return 'bg-yellow-500';
    if (rate >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getUtilizationBadge = (rate: number) => {
    if (rate >= 80) return <Badge variant="default" className="bg-green-500">High</Badge>;
    if (rate >= 50) return <Badge variant="default" className="bg-yellow-500">Medium</Badge>;
    if (rate >= 20) return <Badge variant="default" className="bg-orange-500">Low</Badge>;
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
            <div className="flex items-center text-xs text-green-600">
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
            <div className="flex items-center text-xs text-red-600">
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
            {MOCK_HEATMAP.map(day => (
              <div key={day.day} className="flex-1 text-center">
                <div 
                  className={`h-12 rounded ${getUtilizationColor(day.utilization)} opacity-${Math.round(day.utilization / 10) * 10}`}
                  style={{ opacity: day.utilization / 100 }}
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
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-800 dark:text-orange-200">Underutilized Assets (&lt;20%)</CardTitle>
            </div>
            <CardDescription className="text-orange-700 dark:text-orange-300">
              Consider reviewing these assets for potential sale, rental, or reallocation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {underutilizedAssets.map(asset => (
                <div key={asset.asset_id} className="flex items-center justify-between rounded-lg bg-white p-3 dark:bg-gray-900">
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
                    <td className="py-3 text-right text-green-600">${asset.revenue_generated.toLocaleString()}</td>
                    <td className="py-3 text-right text-red-600">${asset.maintenance_cost.toLocaleString()}</td>
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
