"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Calendar,
  Users,
  FileText,
  Settings,
  Pencil,
  Zap,
  Receipt,
  CreditCard,
  File,
  Package,
  MapPin,
  Handshake,
  LayoutDashboard,
  Activity,
} from 'lucide-react';
import { useQuickActions } from '@/hooks/use-quick-actions';
import { QuickActionsEditor } from './QuickActionsEditor';
import Link from 'next/link';

interface QuickActionsWidgetProps {
  title?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  Plus: <Plus className="h-4 w-4" />,
  Calendar: <Calendar className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  FileText: <FileText className="h-4 w-4" />,
  Settings: <Settings className="h-4 w-4" />,
  Zap: <Zap className="h-4 w-4" />,
  Receipt: <Receipt className="h-4 w-4" />,
  CreditCard: <CreditCard className="h-4 w-4" />,
  File: <File className="h-4 w-4" />,
  Package: <Package className="h-4 w-4" />,
  MapPin: <MapPin className="h-4 w-4" />,
  Handshake: <Handshake className="h-4 w-4" />,
  LayoutDashboard: <LayoutDashboard className="h-4 w-4" />,
  Activity: <Activity className="h-4 w-4" />,
};

export function QuickActionsWidget({ title = "Quick Actions" }: QuickActionsWidgetProps) {
  const { actions, isLoaded, saveActions, resetToDefaults } = useQuickActions();
  const [editorOpen, setEditorOpen] = useState(false);

  const getIcon = (iconName: string) => {
    return iconMap[iconName] || <Plus className="h-4 w-4" />;
  };

  if (!isLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 rounded-md bg-muted animate-pulse"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{title}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setEditorOpen(true)}
            title="Customize Quick Actions"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {actions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant || 'outline'}
                className="h-auto p-4 flex flex-col items-center space-y-2"
                asChild
              >
                <Link href={action.href}>
                  {getIcon(action.icon)}
                  <span className="text-sm font-medium">{action.label}</span>
                </Link>
              </Button>
            ))}
            {actions.length === 0 && (
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2 col-span-2"
                onClick={() => setEditorOpen(true)}
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm font-medium">Add Quick Actions</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <QuickActionsEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        actions={actions}
        onSave={saveActions}
        onReset={resetToDefaults}
      />
    </>
  );
}
