import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, Clock, ExternalLink, XCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';

export interface InboxItemDetailUser {
  id: string;
  name: string;
  avatar_url?: string;
}

export interface InboxItemDetailData {
  id: string;
  type: string;
  title: string;
  body?: string;
  source_entity: string;
  source_id: string;
  status: string;
  due_at?: string;
  created_at: string;
  from_user?: InboxItemDetailUser;
}

export interface InboxItemDetailProps {
  item: InboxItemDetailData;
  typeIcon: React.ElementType;
  sourceIcon: React.ElementType;
  onApprove: () => void;
  onReject: () => void;
  onNavigate: () => void;
}

export function InboxItemDetail({
  item,
  typeIcon: TypeIcon,
  sourceIcon: SourceIcon,
  onApprove,
  onReject,
  onNavigate,
}: InboxItemDetailProps) {
  const isApproval = item.type === 'approval';
  const canAction = isApproval && item.status !== 'actioned';

  return (
    <>
      <SheetHeader>
        <div className="flex items-center gap-2">
          <TypeIcon className="h-5 w-5" />
          <SheetTitle>{item.title}</SheetTitle>
        </div>
      </SheetHeader>

      <div className="mt-6 space-y-6">
        {/* From user */}
        {item.from_user && (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {item.from_user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{item.from_user.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        )}

        {/* Body */}
        {item.body && (
          <div className="prose prose-sm dark:prose-invert">
            <p>{item.body}</p>
          </div>
        )}

        {/* Source link */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
          <SourceIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm capitalize">
            {item.source_entity.replace('_', ' ')}
          </span>
          <Button variant="link" size="sm" className="ml-auto" onClick={onNavigate}>
            View <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </div>

        {/* SLA warning */}
        {item.due_at && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <Clock className="h-4 w-4 text-amber-600" />
            <div className="text-sm">
              <span className="font-medium text-amber-800 dark:text-amber-200">
                Due {formatDistanceToNow(new Date(item.due_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        )}

        {/* Approval actions */}
        {canAction && (
          <div className="flex gap-3 pt-4 border-t">
            <Button className="flex-1" onClick={onApprove}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button variant="outline" className="flex-1" onClick={onReject}>
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </div>
        )}

        {/* Actioned state */}
        {item.status === 'actioned' && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              This item has been actioned
            </span>
          </div>
        )}
      </div>
    </>
  );
}
