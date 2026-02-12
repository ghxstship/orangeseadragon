'use client';

import { useRouter } from 'next/navigation';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  ExternalLink,
  Edit,
  Copy,
  Archive,
  Trash2,
  Link2,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

/**
 * RECORD CONTEXT MENU
 *
 * Generic right-click context menu for any record row/card.
 * Provides standard actions: Open, Edit, Duplicate, Archive, Delete, Copy Link.
 * Uses the ContextMenu UI primitive from the design system.
 */

interface RecordContextMenuProps {
  children: React.ReactNode;
  /** Base path for the entity collection (e.g., '/productions/events') */
  basePath: string;
  /** Record ID */
  recordId: string;
  /** Record display name for confirmation messages */
  recordName?: string;
  /** Callback for duplicate action */
  onDuplicate?: () => void;
  /** Callback for archive action */
  onArchive?: () => void;
  /** Callback for delete action */
  onDelete?: () => void;
  /** Hide specific actions */
  hideActions?: Array<'open' | 'edit' | 'duplicate' | 'archive' | 'delete' | 'copy-link'>;
}

export function RecordContextMenu({
  children,
  basePath,
  recordId,
  recordName,
  onDuplicate,
  onArchive,
  onDelete,
  hideActions = [],
}: RecordContextMenuProps) {
  const router = useRouter();
  const { toast } = useToast();

  const detailPath = `${basePath}/${recordId}`;
  const editPath = `${detailPath}/edit`;

  const handleCopyLink = () => {
    const url = `${window.location.origin}${detailPath}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link copied',
      description: recordName ? `Link to "${recordName}" copied to clipboard` : 'Record link copied to clipboard',
    });
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  const show = (action: string) => !hideActions.includes(action as typeof hideActions[number]);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {show('open') && (
          <ContextMenuItem onClick={() => router.push(detailPath)}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Open
          </ContextMenuItem>
        )}
        {show('edit') && (
          <ContextMenuItem onClick={() => router.push(editPath)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </ContextMenuItem>
        )}
        {show('copy-link') && (
          <ContextMenuItem onClick={handleCopyLink}>
            <Link2 className="h-4 w-4 mr-2" />
            Copy Link
          </ContextMenuItem>
        )}

        {(show('duplicate') || show('archive') || show('delete')) && (
          <ContextMenuSeparator />
        )}

        {show('duplicate') && onDuplicate && (
          <ContextMenuItem onClick={onDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </ContextMenuItem>
        )}
        {show('archive') && onArchive && (
          <ContextMenuItem onClick={onArchive}>
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </ContextMenuItem>
        )}
        {show('delete') && onDelete && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
