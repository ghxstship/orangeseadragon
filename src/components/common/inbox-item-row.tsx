import { formatDistanceToNow } from 'date-fns';
import { Check, Clock, ExternalLink, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface InboxItemRowUser {
  id: string;
  name: string;
  avatar_url?: string;
}

export interface InboxItemRowData {
  id: string;
  type: string;
  title: string;
  body?: string;
  source_entity: string;
  status: string;
  due_at?: string;
  created_at: string;
  from_user?: InboxItemRowUser;
}

export interface InboxItemRowProps {
  item: InboxItemRowData;
  isSelected: boolean;
  typeIcon: React.ElementType;
  onToggleSelect: () => void;
  onMarkRead: () => void;
  onDismiss: () => void;
  onViewDetail: () => void;
  onNavigate: () => void;
}

function getSLAStatus(dueAt: string) {
  const dueDate = new Date(dueAt);
  const now = new Date();
  const hoursRemaining = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursRemaining < 0) return { label: 'Overdue', variant: 'destructive' as const };
  if (hoursRemaining < 4) return { label: `${Math.ceil(hoursRemaining)}h left`, variant: 'destructive' as const };
  if (hoursRemaining < 24) return { label: `${Math.ceil(hoursRemaining)}h left`, variant: 'warning' as const };
  return { label: formatDistanceToNow(dueDate, { addSuffix: true }), variant: 'secondary' as const };
}

export function InboxItemRow({
  item,
  isSelected,
  typeIcon: TypeIcon,
  onToggleSelect,
  onMarkRead,
  onDismiss,
  onViewDetail,
  onNavigate,
}: InboxItemRowProps) {
  const isUnread = item.status === 'unread';
  const isApproval = item.type === 'approval';
  const hasSLA = item.due_at && item.type === 'approval';
  const slaStatus = hasSLA ? getSLAStatus(item.due_at!) : null;

  return (
    <div
      className={cn(
        'group flex items-start gap-3 px-3 py-3 rounded-lg border transition-colors cursor-pointer',
        isUnread ? 'bg-accent/50 border-accent' : 'border-transparent hover:bg-muted/50',
        isSelected && 'ring-2 ring-primary'
      )}
      onClick={onViewDetail}
    >
      {/* Checkbox */}
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox checked={isSelected} onCheckedChange={onToggleSelect} />
      </div>

      {/* Avatar / Icon */}
      {item.from_user ? (
        <Avatar className="h-9 w-9">
          <AvatarFallback>
            {item.from_user.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
          <TypeIcon className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={cn('text-sm truncate', isUnread && 'font-medium')}>
              {item.title}
            </p>
            {item.body && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {item.body}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {slaStatus && (
              <Badge variant={slaStatus.variant} className="text-xs">
                <Clock className="mr-1 h-3 w-3" />
                {slaStatus.label}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="text-xs">
            {item.source_entity.replace('_', ' ')}
          </Badge>
          {isApproval && item.status !== 'actioned' && (
            <Badge variant="warning" className="text-xs">
              Needs approval
            </Badge>
          )}
          {item.status === 'actioned' && (
            <Badge variant="success" className="text-xs">
              Actioned
            </Badge>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onNavigate}>
              <ExternalLink className="mr-2 h-4 w-4" />
              View Source
            </DropdownMenuItem>
            {isUnread && (
              <DropdownMenuItem onClick={onMarkRead}>
                <Check className="mr-2 h-4 w-4" />
                Mark as Read
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onDismiss}>
              Dismiss
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Unread indicator */}
      {isUnread && (
        <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-3" />
      )}
    </div>
  );
}
