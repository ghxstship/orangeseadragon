"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import {
  ArrowLeft,
  Save,
  Share2,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  MoreHorizontal,
  FileText,
  MessageSquare,
  History,
  Paperclip,
  PanelRightClose,
  PanelRight,
} from "lucide-react";
import type { DocumentLayoutConfig } from "./types";

/**
 * DOCUMENT LAYOUT
 * 
 * Rich content editor layout.
 * 2026 Best Practices:
 * - Autosave support
 * - Collaboration presence
 * - Sidebar for outline/comments/history
 * - Full-width editing experience
 */

export interface DocumentCollaborator {
  id: string;
  name: string;
  avatar?: string;
  color?: string;
}

export interface DocumentLayoutProps {
  config: DocumentLayoutConfig;
  loading?: boolean;
  saving?: boolean;
  isDirty?: boolean;
  lastSaved?: Date;
  
  collaborators?: DocumentCollaborator[];
  
  onSave?: () => void;
  onShare?: () => void;
  onBack?: () => void;
  
  activeSidebarSection?: 'outline' | 'comments' | 'history' | 'attachments';
  onSidebarSectionChange?: (section: 'outline' | 'comments' | 'history' | 'attachments') => void;
  
  sidebarContent?: React.ReactNode;
  children: React.ReactNode;
}

const getCollaboratorBorderStyle = (color?: string): React.CSSProperties | undefined =>
  color ? { borderColor: color } : undefined;

const getDocumentSidebarWidthStyle = (width?: number): React.CSSProperties => ({
  width: width || 'var(--sidebar-width-md, 300px)',
});

export function DocumentLayout({
  config,
  loading = false,
  saving = false,
  isDirty = false,
  lastSaved,
  collaborators = [],
  onSave,
  onShare,
  onBack,
  activeSidebarSection = 'outline',
  onSidebarSectionChange,
  sidebarContent,
  children,
}: DocumentLayoutProps) {
  const { isMobile } = useBreakpoint();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const sidebarSections = config.sidebar?.sections || ['outline', 'comments', 'history', 'attachments'];

  const sectionIcons: Record<string, React.ReactNode> = {
    outline: <FileText className="h-4 w-4" />,
    comments: <MessageSquare className="h-4 w-4" />,
    history: <History className="h-4 w-4" />,
    attachments: <Paperclip className="h-4 w-4" />,
  };

  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      onSave?.();
    }
  }, [onSave]);

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  React.useEffect(() => {
    if (!config.sidebar?.enabled) return;

    if (isMobile) {
      setSidebarOpen(false);
      return;
    }

    setSidebarOpen(true);
  }, [config.sidebar?.enabled, isMobile]);

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="border-b p-4">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="flex-1 p-8">
          <div className="max-w-3xl mx-auto space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
          <div className="flex items-start gap-3 min-w-0 sm:items-center sm:gap-4">
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 flex-shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="min-w-0">
              <h1 className="text-lg font-semibold sm:text-xl truncate">{config.title}</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                {saving ? (
                  <span>Saving...</span>
                ) : isDirty ? (
                  <span>Unsaved changes</span>
                ) : lastSaved ? (
                  <span>Saved {lastSaved.toLocaleTimeString()}</span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Collaborators */}
            {config.collaboration?.enabled && config.collaboration.showPresence && collaborators.length > 0 && (
              <div className="hidden sm:flex items-center -space-x-2 mr-2">
                {collaborators.slice(0, 4).map((collaborator) => (
                  <Avatar
                    key={collaborator.id}
                    className="h-7 w-7 border-2 border-background"
                    style={getCollaboratorBorderStyle(collaborator.color)}
                  >
                    <AvatarImage src={collaborator.avatar} />
                    <AvatarFallback className="text-xs">
                      {collaborator.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {collaborators.length > 4 && (
                  <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                    +{collaborators.length - 4}
                  </div>
                )}
              </div>
            )}

            {onShare && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            )}

            {onSave && (
              <Button size="sm" onClick={onSave} disabled={saving || !isDirty}>
                <Save className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Save</span>
              </Button>
            )}

            {config.sidebar?.enabled && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-3xl mx-auto py-8 px-4">
            {children}
          </div>
        </main>

        {/* Sidebar — desktop only */}
        {config.sidebar?.enabled && sidebarOpen && (
          <aside
            className="border-l bg-muted/30 flex-shrink-0 hidden lg:flex flex-col"
            style={getDocumentSidebarWidthStyle(config.sidebar.width)}
          >
            {/* Sidebar Tabs */}
            <div className="flex border-b">
              {sidebarSections.map((section) => (
                <Button
                  type="button"
                  variant="ghost"
                  key={section}
                  onClick={() => onSidebarSectionChange?.(section)}
                  className={cn(
                    "flex-1 h-auto rounded-none flex items-center justify-center gap-2 py-2 text-sm transition-colors",
                    "hover:bg-accent",
                    activeSidebarSection === section && "border-b-2 border-primary font-medium"
                  )}
                >
                  {sectionIcons[section]}
                  <span className="sr-only">{section}</span>
                </Button>
              ))}
            </div>

            {/* Sidebar Content */}
            <ScrollArea className="flex-1">
              <div className="p-4">{sidebarContent}</div>
            </ScrollArea>
          </aside>
        )}

        {/* Sidebar — mobile Sheet */}
        {config.sidebar?.enabled && (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="right" className="w-[300px] p-0 lg:hidden flex flex-col">
              <div className="flex border-b">
                {sidebarSections.map((section) => (
                  <Button
                    type="button"
                    variant="ghost"
                    key={section}
                    onClick={() => onSidebarSectionChange?.(section)}
                    className={cn(
                      "flex-1 h-auto rounded-none flex items-center justify-center gap-2 py-2 text-sm transition-colors",
                      "hover:bg-accent",
                      activeSidebarSection === section && "border-b-2 border-primary font-medium"
                    )}
                  >
                    {sectionIcons[section]}
                    <span className="sr-only">{section}</span>
                  </Button>
                ))}
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4">{sidebarContent}</div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </div>
  );
}

export default DocumentLayout;
