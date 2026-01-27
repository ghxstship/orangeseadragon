"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Settings,
  Share2,
  MoreHorizontal,
  Star,
  Archive,
  Trash2,
  PanelRightClose,
  PanelRight,
} from "lucide-react";
import type { WorkspaceLayoutConfig, TabConfig } from "./types";

/**
 * WORKSPACE LAYOUT
 * 
 * Container for nested entities with project-like structure.
 * 2026 Best Practices:
 * - Contextual header with entity identity
 * - Tab-based navigation for nested content
 * - Real-time collaboration presence
 * - Collapsible sidebar
 * - Keyboard shortcuts (cmd+1-9 for tabs)
 */

export interface WorkspaceCollaborator {
  id: string;
  name: string;
  avatar?: string;
  status?: "online" | "away" | "offline";
  role?: string;
}

export interface WorkspaceLayoutProps {
  config: WorkspaceLayoutConfig;
  loading?: boolean;
  
  currentTab?: string;
  onTabChange?: (tab: string) => void;
  
  collaborators?: WorkspaceCollaborator[];
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  onShare?: () => void;
  onSettings?: () => void;
  onBack?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  
  sidebarContent?: React.ReactNode;
  children: React.ReactNode;
}

export function WorkspaceLayout({
  config,
  loading = false,
  currentTab,
  onTabChange,
  collaborators = [],
  isFavorite = false,
  onFavoriteToggle,
  onShare,
  onSettings,
  onBack,
  onArchive,
  onDelete,
  sidebarContent,
  children,
}: WorkspaceLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(config.sidebar?.defaultOpen ?? true);
  
  const activeTab = currentTab || config.defaultTab || config.tabs[0]?.key;
  const onlineCollaborators = collaborators.filter(c => c.status === 'online');

  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '9') {
      const index = parseInt(e.key) - 1;
      if (index < config.tabs.length) {
        e.preventDefault();
        onTabChange?.(config.tabs[index].key);
      }
    }
  }, [config.tabs, onTabChange]);

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="border-b p-4">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            {config.header?.showBackButton && onBack && (
              <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            
            <div className="flex items-center gap-3">
              {config.icon && <div className="flex-shrink-0">{config.icon}</div>}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold">{config.title}</h1>
                </div>
                {config.subtitle && (
                  <p className="text-sm text-muted-foreground">{config.subtitle}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Collaborator Presence */}
            {config.header?.showPresence && onlineCollaborators.length > 0 && (
              <TooltipProvider>
                <div className="flex items-center -space-x-2 mr-2">
                  {onlineCollaborators.slice(0, 4).map((collaborator) => (
                    <Tooltip key={collaborator.id}>
                      <TooltipTrigger asChild>
                        <Avatar className="h-8 w-8 border-2 border-background">
                          <AvatarImage src={collaborator.avatar} />
                          <AvatarFallback className="text-xs">
                            {collaborator.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{collaborator.name}</p>
                        {collaborator.role && (
                          <p className="text-xs text-muted-foreground">{collaborator.role}</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                  {onlineCollaborators.length > 4 && (
                    <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                      +{onlineCollaborators.length - 4}
                    </div>
                  )}
                </div>
              </TooltipProvider>
            )}

            {config.header?.showFavorite && onFavoriteToggle && (
              <Button variant="ghost" size="icon" onClick={onFavoriteToggle} className="h-8 w-8">
                <Star className={cn("h-4 w-4", isFavorite && "fill-yellow-400 text-yellow-400")} />
              </Button>
            )}

            {config.header?.showShare && onShare && (
              <Button variant="ghost" size="icon" onClick={onShare} className="h-8 w-8">
                <Share2 className="h-4 w-4" />
              </Button>
            )}

            {config.header?.showSettings && onSettings && (
              <Button variant="ghost" size="icon" onClick={onSettings} className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            )}

            {(onArchive || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onArchive && (
                    <DropdownMenuItem onClick={onArchive}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={onDelete} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {config.sidebar?.enabled && sidebarContent && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="h-8 w-8"
              >
                {sidebarOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        {config.tabPosition !== "left" && config.tabs.length > 0 && (
          <div className="px-6 border-t bg-muted/30">
            <Tabs value={activeTab} onValueChange={onTabChange}>
              <TabsList className="h-12 bg-transparent p-0 gap-0">
                {config.tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.key}
                    value={tab.key}
                    className={cn(
                      "relative h-12 px-4 rounded-none border-b-2 border-transparent",
                      "data-[state=active]:border-primary data-[state=active]:bg-transparent",
                      "hover:bg-accent/50 transition-colors"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {tab.icon && <span className="text-sm">{tab.icon}</span>}
                      <span>{tab.label}</span>
                      {tab.badge?.show && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                          0
                        </Badge>
                      )}
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}
      </header>

      {/* Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar (if tabPosition is left) */}
        {config.tabPosition === "left" && (
          <aside className="w-56 border-r bg-muted/30 flex-shrink-0">
            <ScrollArea className="h-full">
              <nav className="p-2 space-y-1">
                {config.tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => onTabChange?.(tab.key)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      "hover:bg-accent",
                      activeTab === tab.key && "bg-accent font-medium"
                    )}
                  >
                    {tab.icon && <span>{tab.icon}</span>}
                    <span className="flex-1 text-left">{tab.label}</span>
                    {tab.badge?.show && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-xs">0</Badge>
                    )}
                  </button>
                ))}
              </nav>
            </ScrollArea>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>

        {/* Right Sidebar */}
        {config.sidebar?.enabled && sidebarContent && sidebarOpen && (
          <aside
            className="border-l bg-muted/30 flex-shrink-0 overflow-auto"
            style={{ width: config.sidebar.width || 320 }}
          >
            <div className="p-4">{sidebarContent}</div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default WorkspaceLayout;
