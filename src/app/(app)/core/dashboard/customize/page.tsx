'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { GripVertical, Plus, Save, RotateCcw } from 'lucide-react';

interface WidgetConfig {
  id: string;
  name: string;
  enabled: boolean;
  size: 'small' | 'medium' | 'large';
}

const defaultWidgets: WidgetConfig[] = [
  { id: 'metrics', name: 'Key Metrics', enabled: true, size: 'large' },
  { id: 'schedule', name: 'Today\'s Schedule', enabled: true, size: 'medium' },
  { id: 'tasks', name: 'Upcoming Tasks', enabled: true, size: 'medium' },
  { id: 'quick-actions', name: 'Quick Actions', enabled: true, size: 'small' },
  { id: 'activity', name: 'Recent Activity', enabled: true, size: 'small' },
  { id: 'calendar', name: 'Calendar Preview', enabled: false, size: 'medium' },
  { id: 'notifications', name: 'Notifications', enabled: false, size: 'small' },
  { id: 'team', name: 'Team Status', enabled: false, size: 'medium' },
];

export default function DashboardCustomizePage() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(defaultWidgets);
  const [saving, setSaving] = useState(false);

  const toggleWidget = (id: string) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setSaving(false);
  };

  const handleReset = () => {
    setWidgets(defaultWidgets);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customize Dashboard</h1>
          <p className="text-muted-foreground">Configure which widgets appear on your dashboard</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Layout'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Available Widgets</CardTitle>
            <CardDescription>Toggle widgets on or off to customize your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {widgets.map((widget) => (
              <div key={widget.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                  <div>
                    <Label htmlFor={widget.id} className="font-medium">{widget.name}</Label>
                    <p className="text-sm text-muted-foreground">Size: {widget.size}</p>
                  </div>
                </div>
                <Switch
                  id={widget.id}
                  checked={widget.enabled}
                  onCheckedChange={() => toggleWidget(widget.id)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Layout Preview</CardTitle>
            <CardDescription>Preview of your dashboard layout</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 grid-cols-4 min-h-[400px] rounded-lg border border-dashed p-4 bg-muted/20">
              {widgets.filter(w => w.enabled).map((widget) => (
                <div
                  key={widget.id}
                  className={`rounded-lg border bg-background p-3 ${
                    widget.size === 'large' ? 'col-span-4' :
                    widget.size === 'medium' ? 'col-span-2' : 'col-span-1'
                  }`}
                >
                  <p className="text-xs font-medium truncate">{widget.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Custom Widget</CardTitle>
          <CardDescription>Create a new widget for your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Custom Widget
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
