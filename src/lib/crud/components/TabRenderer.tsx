'use client';

import * as React from 'react';
import {
  DetailTabDefinition,
  EntityRecord,
  EntitySchema,
  OverviewBlockDefinition,
  QuickStatDefinition,
} from '@/lib/schema/types';
import { CrudList } from './CrudList';
import { getSchema } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  Send,
  Paperclip,
  FileText,
  Image as ImageIcon,
  File,
  Download,
  Trash2,
  Upload,
  Clock,
  User,
  Edit3,
  Plus,
  ArrowRight,
} from 'lucide-react';

interface TabRendererProps {
  schema: EntitySchema;
  tabConfig?: DetailTabDefinition;
  record: EntityRecord;
  onRefresh: () => void;
}

/**
 * TAB RENDERER COMPONENT
 *
 * Renders tab content based on schema configuration.
 * Supports overview, related entities, activity, comments, files, etc.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function TabRenderer({ schema, tabConfig, record, onRefresh }: TabRendererProps) {
  if (!tabConfig) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Tab configuration not found</p>
      </div>
    );
  }

  const { content } = tabConfig;

  switch (content.type) {
    case 'overview':
      return <OverviewTab schema={schema} record={record} />;

    case 'related':
      return (
        <RelatedTab
          relatedSchema={content.entity}
          foreignKey={content.foreignKey}
          record={record}
          defaultView={content.defaultView}
          allowCreate={content.allowCreate}
        />
      );

    case 'activity':
      return <ActivityTab record={record} />;

    case 'comments':
      return <CommentsTab record={record} />;

    case 'files':
      return <FilesTab record={record} />;

    case 'custom':
      // For custom components, we'd need a component registry
      return <div>Custom tab: {content.component}</div>;

    default:
      return (
        <div className="flex items-center justify-center p-12">
          <p className="text-muted-foreground">Unknown tab type: {content.type}</p>
        </div>
      );
  }
}

/**
 * Overview tab showing stats and key information
 */
function OverviewTab({ schema, record }: { schema: EntitySchema; record: EntityRecord }) {
  const overview = schema.layouts.detail.overview;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      {overview.stats && overview.stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {overview.stats.map(stat => (
            <StatCard key={stat.key} stat={stat} record={record} />
          ))}
        </div>
      )}

      {/* Overview Blocks */}
      {overview.blocks.map(block => (
        <OverviewBlock key={block.key} block={block} record={record} />
      ))}
    </div>
  );
}

/**
 * Related entities tab
 */
interface RelatedTabProps {
  relatedSchema: string;
  foreignKey: string;
  record: EntityRecord;
  defaultView?: string;
  allowCreate?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function RelatedTab({ relatedSchema, foreignKey, record, defaultView, allowCreate }: RelatedTabProps) {
  const schema = getSchema(relatedSchema);

  if (!schema) {
    return (
      <div className="p-6">
        <p className="text-destructive font-semibold">Schema for &quot;{relatedSchema}&quot; not found</p>
      </div>
    );
  }

  return (
    <div className="p-2">
      <CrudList
        schema={schema as EntitySchema<EntityRecord>}
        filter={{ [foreignKey]: record.id }}
      />
    </div>
  );
}

/**
 * Activity timeline tab
 */

type ActivityAction = 'created' | 'updated' | 'status_change' | 'assigned' | 'commented' | 'attached';

interface ActivityEntry {
  id: string;
  action: ActivityAction;
  user: string;
  timestamp: string;
  details?: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
}

const actionConfig: Record<ActivityAction, { icon: React.ElementType; label: string; color: string }> = {
  created: { icon: Plus, label: 'Created', color: 'text-semantic-success' },
  updated: { icon: Edit3, label: 'Updated', color: 'text-primary' },
  status_change: { icon: ArrowRight, label: 'Status changed', color: 'text-semantic-warning' },
  assigned: { icon: User, label: 'Assigned', color: 'text-semantic-info' },
  commented: { icon: MessageSquare, label: 'Commented', color: 'text-muted-foreground' },
  attached: { icon: Paperclip, label: 'Attached file', color: 'text-muted-foreground' },
};

function ActivityTab({ record }: { record: EntityRecord }) {
  const [activities, setActivities] = React.useState<ActivityEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/activity?entityId=${record.id}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setActivities(data.items ?? []);
        }
      } catch {
        // API may not exist yet — show empty state
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchActivities();
    return () => { cancelled = true; };
  }, [record.id]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Clock className="h-10 w-10 text-muted-foreground/30 mb-3" />
        <h3 className="text-sm font-medium">No activity yet</h3>
        <p className="text-xs text-muted-foreground mt-1">Actions on this record will appear here.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" aria-hidden />
        <div className="space-y-6">
          {activities.map((entry) => {
            const config = actionConfig[entry.action] || actionConfig.updated;
            const Icon = config.icon;
            return (
              <div key={entry.id} className="relative flex gap-4 pl-0">
                <div className={cn('relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background border', config.color)}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm">
                    <span className="font-medium">{entry.user}</span>{' '}
                    <span className="text-muted-foreground">{config.label.toLowerCase()}</span>
                    {entry.field && (
                      <span className="text-muted-foreground"> {entry.field}</span>
                    )}
                    {entry.oldValue && entry.newValue && (
                      <span className="text-muted-foreground">
                        {' '}from <Badge variant="outline" className="text-[10px] mx-0.5">{entry.oldValue}</Badge>
                        to <Badge variant="outline" className="text-[10px] mx-0.5">{entry.newValue}</Badge>
                      </span>
                    )}
                  </p>
                  {entry.details && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{entry.details}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Comments tab
 */

interface Comment {
  id: string;
  author: string;
  avatarUrl?: string;
  body: string;
  createdAt: string;
  updatedAt?: string;
}

function CommentsTab({ record }: { record: EntityRecord }) {
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [newComment, setNewComment] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const fetchComments = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/comments?entityId=${record.id}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.items ?? []);
      }
    } catch {
      // API may not exist yet
    } finally {
      setLoading(false);
    }
  }, [record.id]);

  React.useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async () => {
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityId: record.id, body: newComment.trim() }),
      });
      if (res.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch {
      // Silently fail — API may not exist yet
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Compose */}
      <div className="flex gap-3">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <User className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder="Write a comment…"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">⌘ Enter to submit</p>
            <Button size="sm" onClick={handleSubmit} disabled={!newComment.trim() || submitting}>
              <Send className="mr-2 h-3.5 w-3.5" />
              {submitting ? 'Sending…' : 'Comment'}
            </Button>
          </div>
        </div>
      </div>

      {/* Thread */}
      {comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <h3 className="text-sm font-medium">No comments yet</h3>
          <p className="text-xs text-muted-foreground mt-1">Start the conversation.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 group">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-xs font-medium">
                {comment.author.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{comment.author}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                  {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                    <Badge variant="outline" className="text-[9px]">edited</Badge>
                  )}
                </div>
                <p className="text-sm text-foreground/90 mt-1 whitespace-pre-wrap">{comment.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Files tab
 */

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

const fileIconMap: Record<string, React.ElementType> = {
  'image': ImageIcon,
  'application/pdf': FileText,
  'text': FileText,
};

function getFileIcon(mimeType: string): React.ElementType {
  if (mimeType.startsWith('image/')) return fileIconMap['image'];
  if (mimeType === 'application/pdf') return fileIconMap['application/pdf'];
  if (mimeType.startsWith('text/')) return fileIconMap['text'];
  return File;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FilesTab({ record }: { record: EntityRecord }) {
  const [files, setFiles] = React.useState<AttachedFile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchFiles = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/files?entityId=${record.id}`);
      if (res.ok) {
        const data = await res.json();
        setFiles(data.items ?? []);
      }
    } catch {
      // API may not exist yet
    } finally {
      setLoading(false);
    }
  }, [record.id]);

  React.useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('entityId', String(record.id));
      Array.from(fileList).forEach((f) => formData.append('files', f));

      const res = await fetch('/api/files/upload', { method: 'POST', body: formData });
      if (res.ok) {
        fetchFiles();
      }
    } catch {
      // Silently fail
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      const res = await fetch(`/api/files/${fileId}`, { method: 'DELETE' });
      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
      }
    } catch {
      // Silently fail
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Drop zone */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
          dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/40',
          uploading && 'opacity-50 pointer-events-none'
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleUpload(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
        aria-label="Upload files"
      >
        <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm font-medium">{uploading ? 'Uploading…' : 'Drop files here or click to upload'}</p>
        <p className="text-xs text-muted-foreground mt-1">PDF, images, documents up to 25 MB</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
      </div>

      {/* File list */}
      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Paperclip className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <h3 className="text-sm font-medium">No files attached</h3>
          <p className="text-xs text-muted-foreground mt-1">Upload files to attach them to this record.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => {
            const Icon = getFileIcon(file.mimeType);
            return (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors group"
              >
                <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatFileSize(file.size)} · {file.uploadedBy} · {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                    <a href={file.url} download={file.name} aria-label={`Download ${file.name}`}>
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(file.id)}
                    aria-label={`Delete ${file.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Quick stat card component
 */
function StatCard({ stat, record }: { stat: QuickStatDefinition; record: EntityRecord }) {
  // Compute stat value
  let value: string | number = '';

  if (stat.value.type === 'field') {
    value = record[stat.value.field] || 0;
  } else if (stat.value.type === 'computed') {
    value = stat.value.compute(record);
  }

  // Format value
  if (stat.format === 'currency') {
    value = `$${value.toLocaleString()}`;
  } else if (stat.format === 'percentage') {
    value = `${value}%`;
  }

  return (
    <div className="bg-card p-4 rounded-lg border border-border">
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground">{stat.label}</div>
    </div>
  );
}

/**
 * Overview block component
 */
function OverviewBlock({ block, record }: { block: OverviewBlockDefinition; record: EntityRecord }) {
  return (
    <div className="bg-card p-6 rounded-lg border border-border">
      <h4 className="text-lg font-medium mb-4">{block.title || block.key}</h4>

      {block.content.type === 'fields' && (
        <div className="space-y-4">
          {block.content.fields.map((field: string) => (
            <div key={field} className="flex justify-between">
              <span className="text-muted-foreground">{field}:</span>
              <span className="font-medium">{record[field] || 'N/A'}</span>
            </div>
          ))}
        </div>
      )}

      {block.content.type === 'stats' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {block.content.stats.map((statKey: string) => (
            <div key={statKey} className="text-center p-3 rounded-md bg-muted/30">
              <div className="text-xl font-bold text-foreground">{record[statKey] ?? '—'}</div>
              <div className="text-xs text-muted-foreground mt-1">{statKey}</div>
            </div>
          ))}
        </div>
      )}

      {block.content.type === 'chart' && (
        <div className="flex items-center justify-center p-8 text-muted-foreground text-sm">
          Chart: {block.content.chartType}
        </div>
      )}

      {block.content.type === 'custom' && (
        <div className="flex items-center justify-center p-8 text-muted-foreground text-sm">
          Custom component: {block.content.component}
        </div>
      )}
    </div>
  );
}
