"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, RotateCcw } from "lucide-react";
import type { SettingsLayoutConfig } from "./types";

/**
 * SETTINGS LAYOUT
 * 
 * Configuration panels with sidebar navigation.
 * 2026 Best Practices:
 * - Section-based navigation
 * - Sticky header with save/reset
 * - Unsaved changes indicator
 * - Responsive sidebar
 */

export interface SettingsLayoutProps {
  config: SettingsLayoutConfig;
  loading?: boolean;
  saving?: boolean;
  isDirty?: boolean;
  
  currentSection?: string;
  onSectionChange?: (section: string) => void;
  
  onSave?: () => void;
  onReset?: () => void;
  onBack?: () => void;
  
  children: React.ReactNode;
}

export function SettingsLayout({
  config,
  loading = false,
  saving = false,
  isDirty = false,
  currentSection,
  onSectionChange,
  onSave,
  onReset,
  onBack,
  children,
}: SettingsLayoutProps) {
  const activeSection = currentSection || config.defaultSection || config.sections[0]?.key;

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="border-b p-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex flex-1">
          <div className="w-56 border-r p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full mb-2" />
            ))}
          </div>
          <div className="flex-1 p-6">
            <Skeleton className="h-64 w-full" />
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
          <div className="flex items-center gap-4 min-w-0">
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 flex-shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="min-w-0">
              <h1 className="text-lg font-semibold sm:text-xl truncate">{config.title}</h1>
              {config.description && (
                <p className="text-sm text-muted-foreground hidden sm:block">{config.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isDirty && (
              <span className="text-sm text-muted-foreground mr-2 hidden sm:inline">Unsaved changes</span>
            )}
            
            {onReset && (
              <Button variant="outline" size="sm" onClick={onReset} disabled={saving || !isDirty}>
                <RotateCcw className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{config.actions?.reset?.label || 'Reset'}</span>
              </Button>
            )}
            
            {onSave && (
              <Button size="sm" onClick={onSave} disabled={saving || !isDirty}>
                <Save className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{config.actions?.save?.label || 'Save Changes'}</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Navigation — horizontal scrollable tabs */}
        {config.navigation?.position !== "top" && (
          <div className="md:hidden border-b px-4 py-2 bg-muted/30 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2">
              {config.sections.map((section) => (
                <Button
                  key={section.key}
                  variant={activeSection === section.key ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onSectionChange?.(section.key)}
                  className="flex-shrink-0"
                >
                  {section.icon && <span className="mr-1">{section.icon}</span>}
                  {section.title}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Sidebar — desktop only */}
        {config.navigation?.position !== "top" && (
          <aside className={cn(
            "w-56 border-r bg-muted/30 flex-shrink-0 hidden md:block",
            config.navigation?.sticky && "sticky top-0"
          )}>
            <ScrollArea className="h-full">
              <nav className="p-4 space-y-1">
                {config.sections.map((section) => (
                  <Button
                    key={section.key}
                    variant="ghost"
                    onClick={() => onSectionChange?.(section.key)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left h-auto justify-start",
                      "hover:bg-accent",
                      activeSection === section.key && "bg-accent font-medium"
                    )}
                  >
                    {section.icon && <span>{section.icon}</span>}
                    <div className="flex-1">
                      <div>{section.title}</div>
                      {section.description && (
                        <div className="text-xs text-muted-foreground">{section.description}</div>
                      )}
                    </div>
                  </Button>
                ))}
              </nav>
            </ScrollArea>
          </aside>
        )}

        {/* Top Navigation */}
        {config.navigation?.position === "top" && (
          <div className="border-b px-4 sm:px-6 py-2 bg-muted/30 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2">
              {config.sections.map((section) => (
                <Button
                  key={section.key}
                  variant={activeSection === section.key ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onSectionChange?.(section.key)}
                  className="flex-shrink-0"
                >
                  {section.icon && <span className="mr-2">{section.icon}</span>}
                  {section.title}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-3xl mx-auto p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default SettingsLayout;
