'use client';

import * as React from 'react';
import { Plus, GripVertical, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export interface ChecklistItem {
  id: string;
  label: string;
  is_done: boolean;
  order_index: number;
}

interface ChecklistWidgetProps {
  items: ChecklistItem[];
  onAddItem: (label: string) => Promise<void>;
  onToggleItem: (id: string, isDone: boolean) => Promise<void>;
  onUpdateItem: (id: string, label: string) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  onReorderItems?: (items: ChecklistItem[]) => Promise<void>;
  title?: string;
  className?: string;
  readOnly?: boolean;
}

export function ChecklistWidget({
  items,
  onAddItem,
  onToggleItem,
  onUpdateItem,
  onDeleteItem,
  title = 'Checklist',
  className,
  readOnly = false,
}: ChecklistWidgetProps) {
  const [newItemLabel, setNewItemLabel] = React.useState('');
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingLabel, setEditingLabel] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const editInputRef = React.useRef<HTMLInputElement>(null);

  const completedCount = items.filter((item) => item.is_done).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const sortedItems = React.useMemo(
    () => [...items].sort((a, b) => a.order_index - b.order_index),
    [items]
  );

  const handleAddItem = async () => {
    if (!newItemLabel.trim()) return;
    
    try {
      await onAddItem(newItemLabel.trim());
      setNewItemLabel('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to add checklist item:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  const startEditing = (item: ChecklistItem) => {
    setEditingId(item.id);
    setEditingLabel(item.label);
  };

  const saveEdit = async () => {
    if (editingId && editingLabel.trim()) {
      await onUpdateItem(editingId, editingLabel.trim());
    }
    setEditingId(null);
    setEditingLabel('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditingLabel('');
    }
  };

  React.useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium">{title}</h4>
          {totalCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {completedCount}/{totalCount}
            </span>
          )}
        </div>
        {totalCount > 0 && progressPercent === 100 && (
          <div className="flex items-center gap-1 text-xs text-semantic-success">
            <Check className="h-3 w-3" />
            Complete
          </div>
        )}
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <Progress value={progressPercent} className="h-1.5" />
      )}

      {/* Checklist items */}
      <div className="space-y-1">
        {sortedItems.map((item) => (
          <div
            key={item.id}
            className={cn(
              'group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors',
              item.is_done && 'opacity-60'
            )}
          >
            {/* Drag handle */}
            {!readOnly && (
              <GripVertical className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 cursor-grab" />
            )}

            {/* Checkbox */}
            <Checkbox
              checked={item.is_done}
              onCheckedChange={(checked) => onToggleItem(item.id, !!checked)}
              disabled={readOnly}
              className="h-4 w-4"
            />

            {/* Label */}
            {editingId === item.id ? (
              <Input
                ref={editInputRef}
                value={editingLabel}
                onChange={(e) => setEditingLabel(e.target.value)}
                onKeyDown={handleEditKeyDown}
                onBlur={saveEdit}
                className="h-7 text-sm flex-1"
              />
            ) : (
              <span
                className={cn(
                  'flex-1 text-sm',
                  item.is_done && 'line-through text-muted-foreground',
                  !readOnly && 'cursor-pointer'
                )}
                onClick={() => !readOnly && startEditing(item)}
              >
                {item.label}
              </span>
            )}

            {/* Delete button */}
            {!readOnly && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                onClick={() => onDeleteItem(item.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Add item input */}
      {!readOnly && (
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={newItemLabel}
            onChange={(e) => setNewItemLabel(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add item..."
            className="h-8 text-sm"
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleAddItem}
            disabled={!newItemLabel.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Empty state */}
      {totalCount === 0 && readOnly && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No checklist items
        </p>
      )}
    </div>
  );
}
