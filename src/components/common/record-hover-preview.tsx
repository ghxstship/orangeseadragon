'use client';

import { useState } from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

/**
 * RECORD HOVER PREVIEW
 *
 * Generic hover preview for linked records.
 * Shows a mini card with key info when hovering over a record reference.
 * Uses the HoverCard UI primitive from the design system.
 */

interface RecordHoverPreviewProps {
  /** Display label for the trigger */
  children: React.ReactNode;
  /** Record data to display in the preview */
  record?: Record<string, unknown> | null;
  /** Entity type for contextual rendering */
  entityType: string;
  /** Async loader — called on hover if record is not provided */
  onLoad?: () => Promise<Record<string, unknown> | null>;
  /** Side of the trigger to show the preview */
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** Alignment */
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export function RecordHoverPreview({
  children,
  record: initialRecord,
  entityType,
  onLoad,
  side = 'bottom',
  align = 'start',
  className,
}: RecordHoverPreviewProps) {
  const [record, setRecord] = useState(initialRecord);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(!!initialRecord);

  const handleOpenChange = async (open: boolean) => {
    if (open && !loaded && onLoad) {
      setLoading(true);
      try {
        const data = await onLoad();
        setRecord(data);
      } finally {
        setLoading(false);
        setLoaded(true);
      }
    }
  };

  return (
    <HoverCard openDelay={300} closeDelay={100} onOpenChange={handleOpenChange}>
      <HoverCardTrigger asChild>
        <span className={cn('cursor-pointer hover:underline decoration-dotted underline-offset-4', className)}>
          {children}
        </span>
      </HoverCardTrigger>
      <HoverCardContent side={side} align={align} className="w-72 p-0">
        {loading ? (
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ) : record ? (
          <RecordPreviewContent record={record} entityType={entityType} />
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Record not found
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}

function RecordPreviewContent({
  record,
  entityType,
}: {
  record: Record<string, unknown>;
  entityType: string;
}) {
  const name = String(record.name || record.title || record.first_name
    ? `${record.first_name || ''} ${record.last_name || ''}`.trim()
    : 'Untitled');
  const initials = name.slice(0, 2).toUpperCase();
  const status = record.status as string | undefined;
  const subtitle = getSubtitle(record, entityType);
  const details = getDetails(record, entityType);

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="text-xs font-bold">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{name}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
        {status && (
          <Badge variant="outline" className="text-[10px] h-5 shrink-0">
            {status}
          </Badge>
        )}
      </div>
      {details.length > 0 && (
        <div className="space-y-1 border-t pt-2">
          {details.map(({ label, value }) => (
            <div key={label} className="flex justify-between text-xs">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium truncate ml-2">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getSubtitle(record: Record<string, unknown>, entityType: string): string {
  switch (entityType) {
    case 'project': return String(record.client || record.company_name || '');
    case 'person': return String(record.job_title || record.department || '');
    case 'company': return String(record.industry || record.company_type || '');
    case 'venue': return String(record.city || record.address || '');
    case 'event': return String(record.venue_name || '');
    case 'budget': return String(record.project_name || '');
    case 'invoice': return String(record.company_name || '');
    case 'task': return String(record.project_name || '');
    case 'asset': return String(record.category || '');
    default: return '';
  }
}

function getDetails(record: Record<string, unknown>, entityType: string): Array<{ label: string; value: string }> {
  const details: Array<{ label: string; value: string }> = [];

  switch (entityType) {
    case 'project':
      if (record.start_date) details.push({ label: 'Start', value: new Date(record.start_date as string).toLocaleDateString() });
      if (record.budget) details.push({ label: 'Budget', value: `$${Number(record.budget).toLocaleString()}` });
      break;
    case 'person':
      if (record.email) details.push({ label: 'Email', value: String(record.email) });
      if (record.phone) details.push({ label: 'Phone', value: String(record.phone) });
      break;
    case 'company':
      if (record.email) details.push({ label: 'Email', value: String(record.email) });
      if (record.website) details.push({ label: 'Web', value: String(record.website) });
      break;
    case 'venue':
      if (record.capacity) details.push({ label: 'Capacity', value: String(record.capacity) });
      break;
    case 'invoice':
      if (record.total_amount) details.push({ label: 'Total', value: `$${Number(record.total_amount).toLocaleString()}` });
      if (record.due_date) details.push({ label: 'Due', value: new Date(record.due_date as string).toLocaleDateString() });
      break;
    case 'budget':
      if (record.total_amount) details.push({ label: 'Total', value: `$${Number(record.total_amount).toLocaleString()}` });
      break;
    case 'task':
      if (record.due_date) details.push({ label: 'Due', value: new Date(record.due_date as string).toLocaleDateString() });
      if (record.priority) details.push({ label: 'Priority', value: String(record.priority) });
      break;
    case 'asset':
      if (record.location) details.push({ label: 'Location', value: String(record.location) });
      if (record.condition) details.push({ label: 'Condition', value: String(record.condition) });
      break;
  }

  return details;
}
