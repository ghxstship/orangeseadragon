"use client";

import * as React from "react";
import { Eye, Download, ExternalLink, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PreviewType = "image" | "video" | "pdf" | "document" | "custom";

interface PreviewModalProps {
  title: string;
  type?: PreviewType;
  src?: string;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onDownload?: () => void;
  onOpenExternal?: () => void;
  downloadLabel?: string;
  className?: string;
}

export function PreviewModal({
  title,
  type = "custom",
  src,
  children,
  open,
  onOpenChange,
  onDownload,
  onOpenExternal,
  downloadLabel = "Download",
  className,
}: PreviewModalProps) {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const renderPreview = () => {
    switch (type) {
      case "image":
        return src ? (
          <div className="flex items-center justify-center bg-muted rounded-lg overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={title}
              className="max-w-full max-h-[70vh] object-contain"
            />
          </div>
        ) : null;

      case "video":
        return src ? (
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <video
              src={src}
              controls
              className="w-full h-full"
            />
          </div>
        ) : null;

      case "pdf":
        return src ? (
          <div className="w-full h-[70vh] rounded-lg overflow-hidden">
            <iframe
              src={src}
              title={title}
              className="w-full h-full border-0"
            />
          </div>
        ) : null;

      case "document":
        return src ? (
          <div className="w-full h-[70vh] rounded-lg overflow-hidden bg-background">
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(src)}&embedded=true`}
              title={title}
              className="w-full h-full border-0"
            />
          </div>
        ) : null;

      case "custom":
      default:
        return children;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-4xl",
          isFullscreen && "max-w-[95vw] max-h-[95vh]",
          className
        )}
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {title}
          </DialogTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            {onOpenExternal && (
              <Button variant="ghost" size="icon" onClick={onOpenExternal}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
            {onDownload && (
              <Button variant="ghost" size="sm" onClick={onDownload}>
                <Download className="h-4 w-4 mr-2" />
                {downloadLabel}
              </Button>
            )}
          </div>
        </DialogHeader>
        <div className="relative">{renderPreview()}</div>
      </DialogContent>
    </Dialog>
  );
}

interface PreviewTriggerProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}

export function PreviewTrigger({ children, onClick, className }: PreviewTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative group cursor-pointer",
        className
      )}
    >
      {children}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
        <Eye className="h-6 w-6 text-white" />
      </div>
    </button>
  );
}
