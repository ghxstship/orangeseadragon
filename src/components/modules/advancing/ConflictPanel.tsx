'use client';

import * as React from 'react';
import { useState } from 'react';
import { 
  AlertTriangle, 
  AlertCircle,
  Check,
  X,
  ChevronRight,
  RefreshCw,
  Loader2,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface Conflict {
  id: string;
  conflict_type: string;
  severity: 'warning' | 'blocking';
  status: 'open' | 'resolved' | 'ignored';
  description: string;
  entity_type: string;
  entity_id: string;
  conflicting_entity_id?: string;
  conflict_start?: string;
  conflict_end?: string;
  suggested_resolutions?: Array<{ action: string; label: string }>;
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;
  detected_at: string;
}

interface ConflictPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflicts: Conflict[];
  onRefresh: () => void;
  loading?: boolean;
  entityType?: 'advance' | 'item';
  entityId?: string;
}

const conflictTypeLabels: Record<string, string> = {
  double_booking: 'Double Booking',
  overlap: 'Time Overlap',
  insufficient_buffer: 'Insufficient Buffer',
  quantity_exceeded: 'Quantity Exceeded',
  dependency_violation: 'Dependency Issue',
  capacity_exceeded: 'Capacity Exceeded',
};

const severityConfig = {
  blocking: {
    icon: AlertCircle,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
    badge: 'destructive' as const,
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-semantic-warning',
    bg: 'bg-semantic-warning/10',
    border: 'border-semantic-warning/20',
    badge: 'warning' as const,
  },
};

function ConflictItem({ 
  conflict, 
  onResolve, 
  onIgnore,
  resolving 
}: { 
  conflict: Conflict; 
  onResolve: (id: string, notes: string) => void;
  onIgnore: (id: string) => void;
  resolving: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState('');
  
  const config = severityConfig[conflict.severity];
  const Icon = config.icon;
  
  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <motion.div
        layout
        className={cn(
          "border rounded-lg overflow-hidden transition-colors",
          config.border,
          expanded && config.bg
        )}
      >
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="h-auto w-full p-4 justify-start items-start gap-3 text-left hover:bg-muted/50 transition-colors"
          >
            <div className={cn("p-2 rounded-lg", config.bg)}>
              <Icon className={cn("h-4 w-4", config.color)} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={config.badge} className="text-[10px]">
                  {conflict.severity.toUpperCase()}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {conflictTypeLabels[conflict.conflict_type] || conflict.conflict_type}
                </span>
              </div>
              
              <p className="text-sm font-medium line-clamp-2">
                {conflict.description}
              </p>
              
              <p className="text-xs text-muted-foreground mt-1">
                Detected {formatDistanceToNow(new Date(conflict.detected_at), { addSuffix: true })}
              </p>
            </div>
            
            <ChevronRight className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              expanded && "rotate-90"
            )} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4">
            {/* Time window */}
            {conflict.conflict_start && conflict.conflict_end && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(conflict.conflict_start), 'MMM d, h:mm a')}
                  <ArrowRight className="h-3 w-3 inline mx-1" />
                  {format(new Date(conflict.conflict_end), 'MMM d, h:mm a')}
                </span>
              </div>
            )}
            
            {/* Suggested resolutions */}
            {conflict.suggested_resolutions && conflict.suggested_resolutions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Suggested Actions
                </p>
                <div className="flex flex-wrap gap-2">
                  {conflict.suggested_resolutions.map((resolution, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      {resolution.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Resolution notes */}
            <div className="space-y-2">
              <Textarea
                placeholder="Add resolution notes (optional)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="text-sm"
              />
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => onResolve(conflict.id, notes)}
                disabled={resolving}
                className="flex-1"
              >
                {resolving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Resolve
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onIgnore(conflict.id)}
                disabled={resolving}
              >
                <X className="h-4 w-4 mr-1" />
                Ignore
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </motion.div>
    </Collapsible>
  );
}

export function ConflictPanel({
  open,
  onOpenChange,
  conflicts,
  onRefresh,
  loading = false,
}: ConflictPanelProps) {
  const { toast } = useToast();
  const [resolving, setResolving] = useState<string | null>(null);
  
  const openConflicts = conflicts.filter(c => c.status === 'open');
  const blockingCount = openConflicts.filter(c => c.severity === 'blocking').length;
  const warningCount = openConflicts.filter(c => c.severity === 'warning').length;
  
  const handleResolve = async (conflictId: string, notes: string) => {
    setResolving(conflictId);
    
    try {
      const res = await fetch('/api/advancing/conflicts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conflictId,
          action: 'resolve',
          resolutionNotes: notes,
        }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to resolve conflict');
      }
      
      toast({
        title: 'Conflict Resolved',
        description: 'The conflict has been marked as resolved.',
      });
      
      onRefresh();
    } catch (error) {
      console.error('Error resolving conflict:', error);
      toast({
        title: 'Error',
        description: 'Failed to resolve conflict. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setResolving(null);
    }
  };
  
  const handleIgnore = async (conflictId: string) => {
    setResolving(conflictId);
    
    try {
      const res = await fetch('/api/advancing/conflicts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conflictId,
          action: 'ignore',
        }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to ignore conflict');
      }
      
      toast({
        title: 'Conflict Ignored',
        description: 'The conflict has been marked as ignored.',
      });
      
      onRefresh();
    } catch (error) {
      console.error('Error ignoring conflict:', error);
      toast({
        title: 'Error',
        description: 'Failed to ignore conflict. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setResolving(null);
    }
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 overflow-hidden">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <SheetTitle>Conflicts</SheetTitle>
                <div className="flex items-center gap-2 mt-1">
                  {blockingCount > 0 && (
                    <Badge variant="destructive" className="text-[10px]">
                      {blockingCount} BLOCKING
                    </Badge>
                  )}
                  {warningCount > 0 && (
                    <Badge variant="warning" className="text-[10px]">
                      {warningCount} WARNING
                    </Badge>
                  )}
                  {openConflicts.length === 0 && (
                    <span className="text-xs text-muted-foreground">No open conflicts</span>
                  )}
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        </SheetHeader>
        
        <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-100px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">Checking for conflicts...</p>
            </div>
          ) : openConflicts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 rounded-full bg-semantic-success/10 mb-4">
                <Check className="h-8 w-8 text-semantic-success" />
              </div>
              <p className="font-medium">No Conflicts Detected</p>
              <p className="text-sm text-muted-foreground mt-1">
                All items are scheduled without conflicts
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {openConflicts.map(conflict => (
                <ConflictItem
                  key={conflict.id}
                  conflict={conflict}
                  onResolve={handleResolve}
                  onIgnore={handleIgnore}
                  resolving={resolving === conflict.id}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function ConflictBadge({ 
  count, 
  severity = 'blocking',
  onClick 
}: { 
  count: number; 
  severity?: 'blocking' | 'warning';
  onClick?: () => void;
}) {
  if (count === 0) return null;
  
  const config = severityConfig[severity];
  const Icon = config.icon;
  
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "h-auto inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors",
        config.bg,
        config.color,
        "hover:opacity-80"
      )}
    >
      <Icon className="h-3 w-3" />
      {count} {count === 1 ? 'conflict' : 'conflicts'}
    </Button>
  );
}
