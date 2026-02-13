'use client';

import * as React from 'react';
import { Search, X, GitBranch, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type DependencyType = 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';

export interface TaskDependency {
  id: string;
  task_id: string;
  depends_on_task_id: string;
  dependency_type: DependencyType;
  lag_hours: number;
  depends_on_task?: {
    id: string;
    title: string;
    status: string;
  };
}

export interface TaskOption {
  id: string;
  title: string;
  status: string;
  project_id?: string;
}

interface DependencyPickerProps {
  taskId: string;
  dependencies: TaskDependency[];
  availableTasks: TaskOption[];
  onAddDependency: (dependsOnTaskId: string, type: DependencyType, lagHours: number) => Promise<void>;
  onRemoveDependency: (dependencyId: string) => Promise<void>;
  onUpdateDependency: (dependencyId: string, type: DependencyType, lagHours: number) => Promise<void>;
  className?: string;
}

const DEPENDENCY_TYPE_LABELS: Record<DependencyType, string> = {
  finish_to_start: 'Finish → Start',
  start_to_start: 'Start → Start',
  finish_to_finish: 'Finish → Finish',
  start_to_finish: 'Start → Finish',
};

const DEPENDENCY_TYPE_DESCRIPTIONS: Record<DependencyType, string> = {
  finish_to_start: 'This task cannot start until the dependency finishes',
  start_to_start: 'This task cannot start until the dependency starts',
  finish_to_finish: 'This task cannot finish until the dependency finishes',
  start_to_finish: 'This task cannot finish until the dependency starts',
};

export function DependencyPicker({
  taskId,
  dependencies,
  availableTasks,
  onAddDependency,
  onRemoveDependency,
  onUpdateDependency,
  className,
}: DependencyPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedType, setSelectedType] = React.useState<DependencyType>('finish_to_start');
  const [lagHours, setLagHours] = React.useState(0);

  const filteredTasks = React.useMemo(() => {
    const existingDependencyIds = new Set(dependencies.map((d) => d.depends_on_task_id));
    return availableTasks.filter((task) => {
      if (task.id === taskId) return false;
      if (existingDependencyIds.has(task.id)) return false;
      if (!searchQuery) return true;
      return task.title.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [availableTasks, taskId, dependencies, searchQuery]);

  const handleAddDependency = async (dependsOnTaskId: string) => {
    try {
      await onAddDependency(dependsOnTaskId, selectedType, lagHours);
      setSearchQuery('');
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to add dependency:', error);
    }
  };

  const blockedDependencies = dependencies.filter(
    (d) => d.depends_on_task?.status !== 'done'
  );

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-medium">Dependencies</h4>
          {dependencies.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {dependencies.length}
            </Badge>
          )}
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Add Dependency
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Dependency</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Dependency type selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Dependency Type</label>
                <Select
                  value={selectedType}
                  onValueChange={(v) => setSelectedType(v as DependencyType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DEPENDENCY_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {DEPENDENCY_TYPE_DESCRIPTIONS[selectedType]}
                </p>
              </div>

              {/* Lag time */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Lag Time (hours)</label>
                <Input
                  type="number"
                  value={lagHours}
                  onChange={(e) => setLagHours(parseInt(e.target.value) || 0)}
                  min={0}
                  className="w-24"
                />
              </div>

              {/* Task search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Task</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tasks..."
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Task list */}
              <div className="max-h-60 overflow-y-auto space-y-1 border rounded-md p-2">
                {filteredTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No tasks available
                  </p>
                ) : (
                  filteredTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => handleAddDependency(task.id)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">
                          {task.title}
                        </span>
                        <Badge variant="outline" className="text-xs ml-2">
                          {task.status}
                        </Badge>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Blocking warning */}
      {blockedDependencies.length > 0 && (
        <div className="flex items-start gap-2 p-2 rounded-md bg-semantic-warning/10 border border-semantic-warning/20">
          <AlertTriangle className="h-4 w-4 text-semantic-warning mt-0.5" />
          <div className="text-xs">
            <p className="font-medium text-semantic-warning">
              Blocked by {blockedDependencies.length} incomplete task{blockedDependencies.length > 1 ? 's' : ''}
            </p>
            <p className="text-semantic-warning/80">
              Complete dependencies to unblock this task
            </p>
          </div>
        </div>
      )}

      {/* Dependency list */}
      {dependencies.length > 0 ? (
        <div className="space-y-2">
          {dependencies.map((dep) => (
            <DependencyItem
              key={dep.id}
              dependency={dep}
              onRemove={() => onRemoveDependency(dep.id)}
              onUpdate={(type, lag) => onUpdateDependency(dep.id, type, lag)}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No dependencies. This task can start immediately.
        </p>
      )}
    </div>
  );
}

interface DependencyItemProps {
  dependency: TaskDependency;
  onRemove: () => void;
  onUpdate: (type: DependencyType, lagHours: number) => void;
}

function DependencyItem({ dependency, onRemove }: DependencyItemProps) {
  const task = dependency.depends_on_task;
  const isBlocking = task?.status !== 'done';

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-2 rounded-md border',
        isBlocking ? 'border-semantic-warning/20 bg-semantic-warning/5' : 'border-border'
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">
            {task?.title || 'Unknown Task'}
          </span>
          {isBlocking && (
            <Badge variant="warning" className="text-xs">
              Blocking
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
          <span>{DEPENDENCY_TYPE_LABELS[dependency.dependency_type]}</span>
          {dependency.lag_hours > 0 && (
            <>
              <ArrowRight className="h-3 w-3" />
              <span>+{dependency.lag_hours}h lag</span>
            </>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
