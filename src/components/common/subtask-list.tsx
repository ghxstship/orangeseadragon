'use client';

import * as React from 'react';
import { Plus, ChevronRight, ChevronDown, GripVertical, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface Subtask {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  assignee_id?: string;
  parent_id: string;
  depth: number;
  position: number;
  children?: Subtask[];
}

interface SubtaskListProps {
  parentTaskId: string;
  subtasks: Subtask[];
  onAddSubtask: (parentId: string, title: string) => Promise<void>;
  onUpdateSubtask: (id: string, updates: Partial<Subtask>) => Promise<void>;
  onDeleteSubtask: (id: string) => Promise<void>;
  onNavigateToSubtask?: (id: string) => void;
  maxDepth?: number;
  className?: string;
}

export function SubtaskList({
  parentTaskId,
  subtasks,
  onAddSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onNavigateToSubtask,
  maxDepth = 3,
  className,
}: SubtaskListProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = React.useState('');
  const [isAdding, setIsAdding] = React.useState(false);
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());
  const inputRef = React.useRef<HTMLInputElement>(null);

  const completedCount = subtasks.filter((s) => s.status === 'done').length;
  const totalCount = subtasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;
    
    try {
      await onAddSubtask(parentTaskId, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to add subtask:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSubtask();
    } else if (e.key === 'Escape') {
      setNewSubtaskTitle('');
      setIsAdding(false);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleComplete = async (subtask: Subtask) => {
    const newStatus = subtask.status === 'done' ? 'todo' : 'done';
    await onUpdateSubtask(subtask.id, { status: newStatus });
  };

  React.useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium">Subtasks</h4>
          <Badge variant="secondary" className="text-xs">
            {completedCount}/{totalCount}
          </Badge>
        </div>
        {totalCount > 0 && (
          <span className="text-xs text-muted-foreground">{progressPercent}%</span>
        )}
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <Progress value={progressPercent} className="h-1.5" />
      )}

      {/* Subtask list */}
      <div className="space-y-1">
        {subtasks.map((subtask) => (
          <SubtaskItem
            key={subtask.id}
            subtask={subtask}
            isExpanded={expandedIds.has(subtask.id)}
            onToggleExpand={() => toggleExpanded(subtask.id)}
            onToggleComplete={() => toggleComplete(subtask)}
            onDelete={() => onDeleteSubtask(subtask.id)}
            onNavigate={onNavigateToSubtask ? () => onNavigateToSubtask(subtask.id) : undefined}
            maxDepth={maxDepth}
          />
        ))}
      </div>

      {/* Add subtask input */}
      {isAdding ? (
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter subtask title..."
            className="h-8 text-sm"
          />
          <Button size="sm" variant="default" onClick={handleAddSubtask}>
            Add
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add subtask
        </Button>
      )}
    </div>
  );
}

interface SubtaskItemProps {
  subtask: Subtask;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleComplete: () => void;
  onDelete: () => void;
  onNavigate?: () => void;
  maxDepth: number;
}

const getSubtaskIndentStyle = (depth: number): React.CSSProperties => ({
  paddingLeft: `${depth * 16 + 8}px`,
});

function SubtaskItem({
  subtask,
  isExpanded,
  onToggleExpand,
  onToggleComplete,
  onDelete,
  onNavigate,
  maxDepth,
}: SubtaskItemProps) {
  const hasChildren = subtask.children && subtask.children.length > 0;
  const canExpand = hasChildren && subtask.depth < maxDepth;
  const isDone = subtask.status === 'done';

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors',
          isDone && 'opacity-60'
        )}
        style={getSubtaskIndentStyle(subtask.depth || 0)}
      >
        {/* Drag handle */}
        <GripVertical className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 cursor-grab" />

        {/* Expand/collapse */}
        {canExpand ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggleExpand}
            className="h-5 w-5 p-0.5"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        ) : (
          <div className="w-5" />
        )}

        {/* Checkbox */}
        <Checkbox
          checked={isDone}
          onCheckedChange={onToggleComplete}
          className="h-4 w-4"
        />

        {/* Title */}
        <span
          className={cn(
            'flex-1 text-sm cursor-pointer hover:underline',
            isDone && 'line-through text-muted-foreground'
          )}
          onClick={onNavigate}
        >
          {subtask.title}
        </span>

        {/* Priority badge */}
        {subtask.priority && subtask.priority !== 'medium' && (
          <Badge
            variant={subtask.priority === 'urgent' ? 'destructive' : subtask.priority === 'high' ? 'warning' : 'secondary'}
            className="text-xs"
          >
            {subtask.priority}
          </Badge>
        )}

        {/* Actions menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onNavigate && (
              <DropdownMenuItem onClick={onNavigate}>
                Open
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Nested children */}
      {isExpanded && hasChildren && (
        <div>
          {subtask.children!.map((child) => (
            <SubtaskItem
              key={child.id}
              subtask={child}
              isExpanded={false}
              onToggleExpand={() => {}}
              onToggleComplete={() => {}}
              onDelete={() => {}}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}
    </div>
  );
}
