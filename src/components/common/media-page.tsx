"use client";

import * as React from "react";
import { PageHeader } from "./page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Upload,
  LayoutGrid,
  List,
  MoreHorizontal,
  Download,
  Trash2,
  Eye,
  File,
  Image,
  FileText,
  Film,
  Music,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MediaPageConfig, MediaViewType } from "@/config/pages/media-types";

export interface MediaPageProps<T extends object> {
  config: MediaPageConfig;
  items: T[];
  getItemId: (item: T) => string;
  onAction?: (actionId: string, payload?: unknown) => void;
  onItemClick?: (item: T) => void;
  onUpload?: (files: FileList) => void;
  loading?: boolean;
}

function getFileIcon(type?: string) {
  if (!type) return <File className="h-8 w-8" />;
  if (type.startsWith("image/")) return <Image className="h-8 w-8" />;
  if (type.startsWith("video/")) return <Film className="h-8 w-8" />;
  if (type.startsWith("audio/")) return <Music className="h-8 w-8" />;
  if (type.includes("pdf") || type.includes("document")) return <FileText className="h-8 w-8" />;
  return <File className="h-8 w-8" />;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function MediaGridItem<T extends object>({
  item,
  config,
  onItemClick,
  onAction,
}: {
  item: T;
  config: MediaPageConfig;
  onItemClick?: (item: T) => void;
  onAction?: (actionId: string, payload?: unknown) => void;
}) {
  const record = item as Record<string, unknown>;
  const name = String(record[config.item.nameField] ?? "");
  const url = String(record[config.item.urlField] ?? "");
  const thumbnail = config.item.thumbnailField ? String(record[config.item.thumbnailField] ?? "") : url;
  const type = config.item.typeField ? String(record[config.item.typeField] ?? "") : undefined;
  const size = config.item.sizeField ? Number(record[config.item.sizeField] ?? 0) : undefined;
  const isImage = type?.startsWith("image/");

  return (
    <Card className="group cursor-pointer hover:shadow-md transition-shadow" onClick={() => onItemClick?.(item)}>
      <CardContent className="p-0">
        <div className="aspect-square relative bg-muted flex items-center justify-center overflow-hidden rounded-t-lg">
          {isImage && thumbnail ? (
            <img src={thumbnail} alt={name} className="object-cover w-full h-full" />
          ) : (
            <div className="text-muted-foreground">
              {getFileIcon(type)}
            </div>
          )}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="secondary" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {config.actions?.preview && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAction?.("preview", item); }}>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </DropdownMenuItem>
                )}
                {config.actions?.download && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAction?.("download", item); }}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                )}
                {config.actions?.delete && (
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); onAction?.("delete", item); }}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="p-3">
          <p className="text-sm font-medium truncate">{name}</p>
          {config.display?.showFileInfo !== false && (
            <p className="text-xs text-muted-foreground">{formatFileSize(size)}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MediaListItem<T extends object>({
  item,
  config,
  onItemClick,
  onAction,
}: {
  item: T;
  config: MediaPageConfig;
  onItemClick?: (item: T) => void;
  onAction?: (actionId: string, payload?: unknown) => void;
}) {
  const record = item as Record<string, unknown>;
  const name = String(record[config.item.nameField] ?? "");
  const type = config.item.typeField ? String(record[config.item.typeField] ?? "") : undefined;
  const size = config.item.sizeField ? Number(record[config.item.sizeField] ?? 0) : undefined;
  const createdAt = config.item.createdAtField ? String(record[config.item.createdAtField] ?? "") : undefined;

  return (
    <div
      className="flex items-center gap-4 p-3 border rounded-lg cursor-pointer hover:bg-accent/50 group"
      onClick={() => onItemClick?.(item)}
    >
      <div className="text-muted-foreground">
        {getFileIcon(type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {size !== undefined && <span>{formatFileSize(size)}</span>}
          {createdAt && (
            <>
              <span>•</span>
              <span>{new Date(createdAt).toLocaleDateString()}</span>
            </>
          )}
        </div>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
        {config.actions?.preview && (
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onAction?.("preview", item); }}>
            <Eye className="h-4 w-4" />
          </Button>
        )}
        {config.actions?.download && (
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onAction?.("download", item); }}>
            <Download className="h-4 w-4" />
          </Button>
        )}
        {config.actions?.delete && (
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onAction?.("delete", item); }}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function MediaPage<T extends object>({
  config,
  items,
  getItemId,
  onAction,
  onItemClick,
  onUpload,
}: MediaPageProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [viewType, setViewType] = React.useState<MediaViewType>(config.defaultView ?? config.views[0]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const filteredItems = React.useMemo(() => {
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter((item) => {
      const record = item as Record<string, unknown>;
      return String(record[config.item.nameField] ?? "").toLowerCase().includes(query);
    });
  }, [items, searchQuery, config.item.nameField]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload?.(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload?.(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const gridCols = config.display?.columns ?? 4;
  const gridColsClass = gridCols === 2 ? "grid-cols-2" :
                        gridCols === 3 ? "grid-cols-2 md:grid-cols-3" :
                        gridCols === 5 ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-5" :
                        gridCols === 6 ? "grid-cols-2 md:grid-cols-4 lg:grid-cols-6" :
                        "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  const actions = (
    <div className="flex items-center gap-2">
      {config.views.length > 1 && (
        <div className="flex items-center rounded-md border">
          <Button
            variant={viewType === "grid" ? "secondary" : "ghost"}
            size="sm"
            className="rounded-r-none"
            onClick={() => setViewType("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewType === "list" ? "secondary" : "ghost"}
            size="sm"
            className="rounded-l-none"
            onClick={() => setViewType("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      )}
      {config.upload?.enabled && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple={config.upload.maxFiles !== 1}
            accept={config.upload.accept?.join(",")}
            onChange={handleFileSelect}
          />
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={config.title}
        description={config.description}
        actions={actions}
      />

      <div className="flex flex-wrap items-center gap-2">
        {config.toolbar?.search?.enabled !== false && (
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={config.toolbar?.search?.placeholder ?? "Search files..."}
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {config.upload?.enabled && config.upload.dragDrop !== false && (
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Drag and drop files here, or click Upload
          </p>
          {config.upload.accept && (
            <p className="text-xs text-muted-foreground mt-1">
              Accepts: {config.upload.accept.join(", ")}
            </p>
          )}
        </div>
      )}

      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No files found</p>
          </CardContent>
        </Card>
      ) : viewType === "grid" || viewType === "masonry" ? (
        <div className={cn("grid gap-4", gridColsClass)}>
          {filteredItems.map((item) => (
            <MediaGridItem
              key={getItemId(item)}
              item={item}
              config={config}
              onItemClick={onItemClick}
              onAction={onAction}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <MediaListItem
              key={getItemId(item)}
              item={item}
              config={config}
              onItemClick={onItemClick}
              onAction={onAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
