'use client';

import * as React from 'react';
import { Check, ChevronDown, Plus, Star, Users, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface SavedView {
  id: string;
  name: string;
  entity_type: string;
  view_type: string;
  config: Record<string, unknown>;
  filters?: Record<string, unknown>;
  columns?: string[];
  sorting?: { field: string; direction: 'asc' | 'desc' }[];
  is_shared: boolean;
  is_default: boolean;
  user_id?: string;
}

export interface ViewConfig {
  filters: Record<string, unknown>;
  columns: string[];
  sorting: { field: string; direction: 'asc' | 'desc' }[];
  viewType: string;
}

interface SavedViewSelectorProps {
  entityType: string;
  views: SavedView[];
  currentViewId?: string;
  currentConfig: ViewConfig;
  onSelectView: (view: SavedView) => void;
  onSaveView: (name: string, isShared: boolean, isDefault: boolean) => Promise<SavedView>;
  onUpdateView: (id: string, updates: Partial<SavedView>) => Promise<void>;
  onDeleteView: (id: string) => Promise<void>;
  onSetDefault: (id: string) => Promise<void>;
  className?: string;
}

export function SavedViewSelector({
  entityType,
  views,
  currentViewId,
  currentConfig,
  onSelectView,
  onSaveView,
  onUpdateView,
  onDeleteView,
  onSetDefault,
  className,
}: SavedViewSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = React.useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = React.useState(false);
  const [newViewName, setNewViewName] = React.useState('');
  const [isShared, setIsShared] = React.useState(false);
  const [isDefault, setIsDefault] = React.useState(false);
  const [editingView, setEditingView] = React.useState<SavedView | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const currentView = views.find((v) => v.id === currentViewId);
  const personalViews = views.filter((v) => !v.is_shared);
  const sharedViews = views.filter((v) => v.is_shared);

  const hasUnsavedChanges = React.useMemo(() => {
    if (!currentView) return false;
    return JSON.stringify(currentView.config) !== JSON.stringify(currentConfig);
  }, [currentView, currentConfig]);

  const handleSaveNewView = async () => {
    if (!newViewName.trim()) return;
    
    setIsSaving(true);
    try {
      const savedView = await onSaveView(newViewName.trim(), isShared, isDefault);
      onSelectView(savedView);
      setIsSaveDialogOpen(false);
      setNewViewName('');
      setIsShared(false);
      setIsDefault(false);
    } catch (error) {
      console.error('Failed to save view:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRenameView = async () => {
    if (!editingView || !newViewName.trim()) return;
    
    setIsSaving(true);
    try {
      await onUpdateView(editingView.id, { name: newViewName.trim() });
      setIsRenameDialogOpen(false);
      setEditingView(null);
      setNewViewName('');
    } catch (error) {
      console.error('Failed to rename view:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const openRenameDialog = (view: SavedView, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingView(view);
    setNewViewName(view.name);
    setIsRenameDialogOpen(true);
  };

  const handleDeleteView = async (view: SavedView, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete view "${view.name}"?`)) {
      await onDeleteView(view.id);
    }
  };

  const handleSetDefault = async (view: SavedView, e: React.MouseEvent) => {
    e.stopPropagation();
    await onSetDefault(view.id);
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={cn('gap-2', className)}>
            {currentView ? (
              <>
                {currentView.is_shared && <Users className="h-3 w-3" />}
                {currentView.is_default && <Star className="h-3 w-3 fill-current" />}
                <span className="max-w-32 truncate">{currentView.name}</span>
                {hasUnsavedChanges && (
                  <span className="h-1.5 w-1.5 rounded-full bg-semantic-warning" />
                )}
              </>
            ) : (
              <span className="text-muted-foreground">Select View</span>
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          {/* Personal views */}
          {personalViews.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                My Views
              </div>
              {personalViews.map((view) => (
                <ViewMenuItem
                  key={view.id}
                  view={view}
                  isSelected={view.id === currentViewId}
                  onSelect={() => {
                    onSelectView(view);
                    setIsOpen(false);
                  }}
                  onRename={(e) => openRenameDialog(view, e)}
                  onDelete={(e) => handleDeleteView(view, e)}
                  onSetDefault={(e) => handleSetDefault(view, e)}
                />
              ))}
              <DropdownMenuSeparator />
            </>
          )}

          {/* Shared views */}
          {sharedViews.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Shared Views
              </div>
              {sharedViews.map((view) => (
                <ViewMenuItem
                  key={view.id}
                  view={view}
                  isSelected={view.id === currentViewId}
                  onSelect={() => {
                    onSelectView(view);
                    setIsOpen(false);
                  }}
                  onRename={(e) => openRenameDialog(view, e)}
                  onDelete={(e) => handleDeleteView(view, e)}
                  onSetDefault={(e) => handleSetDefault(view, e)}
                />
              ))}
              <DropdownMenuSeparator />
            </>
          )}

          {/* Save current view */}
          <DropdownMenuItem
            onClick={() => {
              setIsSaveDialogOpen(true);
              setIsOpen(false);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Save Current View
          </DropdownMenuItem>

          {/* Update current view */}
          {currentView && hasUnsavedChanges && (
            <DropdownMenuItem
              onClick={async () => {
                await onUpdateView(currentView.id, { config: currentConfig as unknown as Record<string, unknown> });
                setIsOpen(false);
              }}
            >
              <Check className="mr-2 h-4 w-4" />
              Update &ldquo;{currentView.name}&rdquo;
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Save New View Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save View</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="view-name">View Name</Label>
              <Input
                id="view-name"
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                placeholder="My custom view"
                autoFocus
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is-shared">Share with team</Label>
                <p className="text-xs text-muted-foreground">
                  Others in your organization can use this view
                </p>
              </div>
              <Switch
                id="is-shared"
                checked={isShared}
                onCheckedChange={setIsShared}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is-default">Set as default</Label>
                <p className="text-xs text-muted-foreground">
                  Load this view automatically for {entityType}
                </p>
              </div>
              <Switch
                id="is-default"
                checked={isDefault}
                onCheckedChange={setIsDefault}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewView} disabled={!newViewName.trim() || isSaving}>
              {isSaving ? 'Saving...' : 'Save View'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename View Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename View</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rename-view">View Name</Label>
            <Input
              id="rename-view"
              value={newViewName}
              onChange={(e) => setNewViewName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameView} disabled={!newViewName.trim() || isSaving}>
              {isSaving ? 'Saving...' : 'Rename'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface ViewMenuItemProps {
  view: SavedView;
  isSelected: boolean;
  onSelect: () => void;
  onRename: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onSetDefault: (e: React.MouseEvent) => void;
}

function ViewMenuItem({
  view,
  isSelected,
  onSelect,
  onRename,
  onDelete,
  onSetDefault,
}: ViewMenuItemProps) {
  return (
    <div
      className={cn(
        'group flex items-center justify-between px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent',
        isSelected && 'bg-accent'
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2 min-w-0">
        {isSelected && <Check className="h-4 w-4 shrink-0" />}
        {!isSelected && <div className="w-4" />}
        <span className="truncate text-sm">{view.name}</span>
        {view.is_default && (
          <Star className="h-3 w-3 text-semantic-warning fill-current shrink-0" />
        )}
        {view.is_shared && (
          <Users className="h-3 w-3 text-muted-foreground shrink-0" />
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onRename}
        >
          <Pencil className="h-3 w-3" />
        </Button>
        {!view.is_default && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onSetDefault}
          >
            <Star className="h-3 w-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
