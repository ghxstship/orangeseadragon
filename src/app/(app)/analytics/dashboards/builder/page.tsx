'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { WorkspaceLayout } from '@/lib/layouts';
import type { WorkspaceLayoutConfig } from '@/lib/layouts/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  LayoutDashboard,
  BarChart3,
  Hash,
  Table2,
  Type,
  Minus,
  Calendar,
  Activity,
  ListTodo,
  GripVertical,
  Plus,
} from 'lucide-react';

interface WidgetDef {
  type: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

const widgetPalette: WidgetDef[] = [
  { type: 'kpi', label: 'KPI Card', icon: Hash, description: 'Single metric with trend' },
  { type: 'chart', label: 'Chart', icon: BarChart3, description: 'Bar, line, pie, or area chart' },
  { type: 'table', label: 'Table', icon: Table2, description: 'Data table with sorting' },
  { type: 'calendar', label: 'Calendar', icon: Calendar, description: 'Mini calendar view' },
  { type: 'activity', label: 'Activity', icon: Activity, description: 'Recent activity feed' },
  { type: 'tasks', label: 'Tasks', icon: ListTodo, description: 'Task list widget' },
  { type: 'heading', label: 'Heading', icon: Type, description: 'Section heading text' },
  { type: 'divider', label: 'Divider', icon: Minus, description: 'Visual separator' },
];

interface PlacedWidget {
  id: string;
  type: string;
  label: string;
  size: 'small' | 'medium' | 'large';
}

export default function DashboardBuilderPage() {
  const router = useRouter();
  const [dashboardName, setDashboardName] = React.useState('Untitled Dashboard');
  const [widgets, setWidgets] = React.useState<PlacedWidget[]>([]);
  const [activeTab, setActiveTab] = React.useState('canvas');

  const addWidget = (def: WidgetDef) => {
    setWidgets((prev) => [
      ...prev,
      { id: `w-${Date.now()}`, type: def.type, label: def.label, size: 'medium' },
    ]);
  };

  const removeWidget = (id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
  };

  const config: WorkspaceLayoutConfig = {
    title: dashboardName,
    icon: 'LayoutDashboard',
    tabs: [
      { key: 'canvas', label: 'Canvas' },
      { key: 'settings', label: 'Settings' },
    ],
  };

  const sidebarContent = (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-3">Widget Palette</h3>
        <div className="space-y-1">
          {widgetPalette.map((w) => {
            const Icon = w.icon;
            return (
              <Button
                type="button"
                variant="ghost"
                key={w.type}
                onClick={() => addWidget(w)}
                className="h-auto w-full p-2 justify-start items-center gap-3 rounded-md hover:bg-muted text-left group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium">{w.label}</p>
                  <p className="text-[10px] text-muted-foreground">{w.description}</p>
                </div>
                <Plus className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <WorkspaceLayout
      config={config}
      currentTab={activeTab}
      onTabChange={setActiveTab}
      onBack={() => router.push('/analytics/dashboards')}
      sidebarContent={sidebarContent}
    >
      {activeTab === 'canvas' && (
        <div className="p-6 space-y-4">
          <Input
            value={dashboardName}
            onChange={(e) => setDashboardName(e.target.value)}
            className="text-lg font-semibold border-none shadow-none px-0 focus-visible:ring-0"
          />

          {widgets.length === 0 ? (
            <Card>
              <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                <LayoutDashboard className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Empty Dashboard</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Drag widgets from the sidebar or click to add them
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {widgets.map((widget) => {
                const def = widgetPalette.find((w) => w.type === widget.type);
                const Icon = def?.icon || BarChart3;
                return (
                  <Card key={widget.id} className="group relative">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="text-xs font-medium flex-1">{widget.label}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={() => removeWidget(widget.id)}
                        >
                          ×
                        </Button>
                      </div>
                      <div className="h-24 rounded bg-muted/50 flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">Widget preview</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="p-6 max-w-lg space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Dashboard Name</label>
            <Input value={dashboardName} onChange={(e) => setDashboardName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Visibility</label>
            <p className="text-xs text-muted-foreground">Control who can see this dashboard</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Personal</Button>
              <Button variant="outline" size="sm">Team</Button>
              <Button variant="outline" size="sm">Public</Button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Auto-refresh</label>
            <p className="text-xs text-muted-foreground">Automatically refresh data at an interval</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Off</Button>
              <Button variant="outline" size="sm">1 min</Button>
              <Button variant="outline" size="sm">5 min</Button>
              <Button variant="outline" size="sm">15 min</Button>
            </div>
          </div>
        </div>
      )}
    </WorkspaceLayout>
  );
}
