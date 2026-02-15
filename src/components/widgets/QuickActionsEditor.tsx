'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Calendar,
  Users,
  FileText,
  Settings,
  GripVertical,
  X,
  Zap,
  Receipt,
  CreditCard,
  File,
  Package,
  MapPin,
  Handshake,
  LayoutDashboard,
  Activity,
  RotateCcw,
} from 'lucide-react';
import { QuickAction, AVAILABLE_ACTIONS } from '@/hooks/use-quick-actions';
import { cn } from '@/lib/utils';

interface QuickActionsEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions: QuickAction[];
  onSave: (actions: QuickAction[]) => void;
  onReset: () => void;
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

export function QuickActionsEditor({
  open,
  onOpenChange,
  actions,
  onSave,
  onReset,
}: QuickActionsEditorProps) {
  const [localActions, setLocalActions] = useState<QuickAction[]>(actions);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  React.useEffect(() => {
    setLocalActions(actions);
  }, [actions, open]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newActions = [...localActions];
    const [removed] = newActions.splice(draggedIndex, 1);
    newActions.splice(index, 0, removed);
    setLocalActions(newActions);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleRemove = (actionId: string) => {
    setLocalActions(localActions.filter(a => a.id !== actionId));
  };

  const handleAdd = (action: QuickAction) => {
    if (!localActions.find(a => a.id === action.id)) {
      setLocalActions([...localActions, action]);
    }
  };

  const handleSave = () => {
    onSave(localActions);
    onOpenChange(false);
  };

  const handleReset = () => {
    onReset();
    onOpenChange(false);
  };

  const availableToAdd = AVAILABLE_ACTIONS.filter(
    a => !localActions.find(la => la.id === a.id)
  );

  const categoryLabels: Record<string, string> = {
    form: 'Create Forms',
    workflow: 'Workflows',
    navigation: 'Navigation',
  };

  const groupedAvailable = availableToAdd.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, QuickAction[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Customize Quick Actions</DialogTitle>
          <DialogDescription>
            Add, remove, and reorder your quick actions. Drag items to reorder.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          {/* Current Actions */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Your Quick Actions ({localActions.length})
            </h4>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {localActions.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No actions configured. Add some from the right panel.
                  </p>
                ) : (
                  localActions.map((action, index) => (
                    <div
                      key={action.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded-md border bg-card cursor-move transition-colors',
                        draggedIndex === index && 'opacity-50 border-primary'
                      )}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {iconMap[action.icon] || <Plus className="h-4 w-4" />}
                        <span className="text-sm truncate">{action.label}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={() => handleRemove(action.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Available Actions */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Available Actions
            </h4>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {Object.entries(groupedAvailable).map(([category, categoryActions]) => (
                  <div key={category} className="space-y-2">
                    <Badge variant="outline" className="text-xs">
                      {categoryLabels[category] || category}
                    </Badge>
                    <div className="space-y-1">
                      {categoryActions.map((action) => (
                        <Button
                          key={action.id}
                          variant="ghost"
                          onClick={() => handleAdd(action)}
                          className="flex items-center gap-2 p-2 rounded-md border bg-card hover:bg-accent w-full text-left transition-colors h-auto justify-start"
                        >
                          <Plus className="h-3 w-3 text-muted-foreground" />
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {iconMap[action.icon] || <Plus className="h-4 w-4" />}
                            <span className="text-sm truncate">{action.label}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
                {availableToAdd.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    All available actions have been added.
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
