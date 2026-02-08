"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Edit,
  Share2,
  MoreHorizontal,
  Trash2,
  PanelRightClose,
  PanelRight,
} from "lucide-react";
import type { EntitySchema } from "@/lib/schema/types";

/**
 * DETAIL LAYOUT
 * 
 * Unified detail layout that accepts EntitySchema directly.
 * All configuration comes from the schema.
 */

export interface DetailLayoutProps<T extends object> {
  schema: EntitySchema<T>;
  record: T;
  loading?: boolean;
  
  currentTab?: string;
  onTabChange?: (tab: string) => void;
  
  onBack?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  onAction?: (actionId: string) => void;
  
  sidebarContent?: React.ReactNode;
  children: React.ReactNode;
}

export function DetailLayout<T extends object>({
  schema,
  record,
  loading = false,
  currentTab,
  onTabChange,
  onBack,
  onEdit,
  onDelete,
  onShare,
  onAction,
  sidebarContent,
  children,
}: DetailLayoutProps<T>) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  
  const detailConfig = schema.layouts.detail;
  const activeTab = currentTab || detailConfig.tabs[0]?.key;

  const title = React.useMemo(() => {
    const titleDef = schema.display.title;
    if (typeof titleDef === 'function') {
      return titleDef(record);
    }
    return String((record as Record<string, unknown>)[titleDef] || 'Untitled');
  }, [schema.display, record]);

  const subtitle = React.useMemo(() => {
    const subtitleDef = schema.display.subtitle;
    if (!subtitleDef) return null;
    if (typeof subtitleDef === 'function') {
      return subtitleDef(record);
    }
    return String((record as Record<string, unknown>)[subtitleDef] || '');
  }, [schema.display, record]);

  const badge = React.useMemo(() => {
    if (!schema.display.badge) return null;
    return schema.display.badge(record);
  }, [schema.display, record]);

  const imageUrl = React.useMemo(() => {
    const imageDef = schema.display.image;
    if (!imageDef) return '';
    if (typeof imageDef === 'function') {
      return imageDef(record) || '';
    }
    return String((record as Record<string, unknown>)[imageDef] || '');
  }, [schema.display, record]);

  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '9') {
      const index = parseInt(e.key) - 1;
      if (index < detailConfig.tabs.length) {
        e.preventDefault();
        onTabChange?.(detailConfig.tabs[index].key);
      }
    }
  }, [detailConfig.tabs, onTabChange]);

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="border-b p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
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
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            
            {imageUrl && (
              <Avatar className="h-12 w-12">
                <AvatarImage src={imageUrl} />
                <AvatarFallback>{title.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            )}
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{title}</h1>
                {badge && (
                  <Badge variant={(badge.variant as "default" | "secondary" | "destructive" | "outline") || "secondary"}>
                    {badge.label}
                  </Badge>
                )}
              </div>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            
            {onShare && (
              <Button variant="ghost" size="icon" onClick={onShare} className="h-8 w-8">
                <Share2 className="h-4 w-4" />
              </Button>
            )}

            {(schema.actions?.row || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {schema.actions?.row?.map((action) => (
                    <DropdownMenuItem key={action.key} onClick={() => onAction?.(action.key)}>
                      {action.label}
                    </DropdownMenuItem>
                  ))}
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

            {detailConfig.sidebar && sidebarContent && (
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
        {detailConfig.tabs.length > 1 && (
          <div className="px-6 border-t bg-muted/30">
            <Tabs value={activeTab} onValueChange={onTabChange}>
              <TabsList variant="underline">
                {detailConfig.tabs.map((tab) => (
                  <TabsTrigger key={tab.key} value={tab.key}>
                    <div className="flex items-center gap-2">
                      {tab.icon && <span className="text-sm">{tab.icon}</span>}
                      <span>{tab.label}</span>
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
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>

        {/* Sidebar */}
        {detailConfig.sidebar && sidebarContent && sidebarOpen && (
          <aside
            className="border-l bg-muted/30 flex-shrink-0 overflow-auto hidden lg:block"
            style={{ width: detailConfig.sidebar.width || 'var(--sidebar-width-lg, 320px)' }}
          >
            <ScrollArea className="h-full">
              <div className="p-4">{sidebarContent}</div>
            </ScrollArea>
          </aside>
        )}
      </div>
    </div>
  );
}

export default DetailLayout;
