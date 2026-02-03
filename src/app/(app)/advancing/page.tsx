'use client';

import { useEffect, useState } from 'react';
import { DashboardTemplate, DashboardSection } from '@/components/templates/DashboardTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

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

export default function AdvancingDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [criticalItems, setCriticalItems] = useState<CriticalItem[]>([]);
  const [upcomingDeliveries, setUpcomingDeliveries] = useState<CriticalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
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
    }
    fetchDashboard();
  }, []);

  const completionRate = metrics ? Math.round((metrics.completedItems / Math.max(metrics.totalItems, 1)) * 100) : 0;
  const budgetConfirmedRate = metrics ? Math.round((metrics.confirmedBudget / Math.max(metrics.totalBudget, 1)) * 100) : 0;

  const dashboardSections: DashboardSection[] = [
    {
      id: 'metrics',
      widgets: [
        { 
          id: 'total-items', 
          title: 'Total Items', 
          type: 'metric', 
          size: 'small', 
          value: metrics?.totalItems || 0,
        },
        { 
          id: 'completed', 
          title: 'Completed', 
          type: 'metric', 
          size: 'small', 
          value: `${completionRate}%`,
          change: metrics?.completedItems,
          changeLabel: 'items done'
        },
        { 
          id: 'critical', 
          title: 'Critical Pending', 
          type: 'metric', 
          size: 'small', 
          value: metrics?.criticalPending || 0,
        },
        { 
          id: 'budget', 
          title: 'Budget Confirmed', 
          type: 'metric', 
          size: 'small', 
          value: `${budgetConfirmedRate}%`,
          change: metrics?.confirmedBudget ? Math.round(metrics.confirmedBudget / 1000) : 0,
          changeLabel: 'confirmed'
        },
      ],
    },
    {
      id: 'navigation',
      title: 'Quick Access',
      widgets: [
        { id: 'advances-nav', title: 'Advances', description: 'Production advances by event', type: 'custom', size: 'medium' },
        { id: 'items-nav', title: 'Items', description: 'All advance items by category', type: 'custom', size: 'medium' },
        { id: 'fulfillment-nav', title: 'Fulfillment', description: 'Delivery & installation tracking', type: 'custom', size: 'medium' },
        { id: 'vendors-nav', title: 'Vendors', description: 'Vendor coordination & performance', type: 'custom', size: 'medium' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <DashboardTemplate
        title="Advancing"
        subtitle="Production advance coordination"
        sections={dashboardSections}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6">
        {/* Critical Path Items */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-lg">Critical Path Items</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : criticalItems.length === 0 ? (
              <div className="flex items-center gap-2 text-green-600">
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

        {/* Upcoming Deliveries */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
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

      {/* Budget Overview */}
      {metrics && metrics.totalBudget > 0 && (
        <div className="px-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
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
                  <div className="text-2xl font-bold text-green-600">${(metrics.confirmedBudget / 1000).toFixed(1)}K</div>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-1">Pending</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    ${((metrics.totalBudget - metrics.confirmedBudget) / 1000).toFixed(1)}K
                  </div>
                </div>
              </div>
              <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${budgetConfirmedRate}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
