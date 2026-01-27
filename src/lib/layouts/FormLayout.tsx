"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, X, Loader2 } from "lucide-react";
import type { EntitySchema } from "@/lib/schema/types";

/**
 * FORM LAYOUT
 * 
 * Unified form layout that accepts EntitySchema directly.
 * All configuration comes from the schema.
 */

export interface FormLayoutProps<T extends object> {
  schema: EntitySchema<T>;
  mode: 'create' | 'edit';
  loading?: boolean;
  saving?: boolean;
  isDirty?: boolean;
  isValid?: boolean;
  
  onSave: () => void;
  onCancel: () => void;
  
  sidebarContent?: React.ReactNode;
  children: React.ReactNode;
}

export function FormLayout<T extends object>({
  schema,
  mode,
  loading = false,
  saving = false,
  isDirty = false,
  isValid = true,
  onSave,
  onCancel,
  sidebarContent,
  children,
}: FormLayoutProps<T>) {
  const formConfig = schema.layouts.form;
  
  const title = mode === 'create' 
    ? `Create ${schema.identity.name}` 
    : `Edit ${schema.identity.name}`;
  
  const description = mode === 'create'
    ? `Add a new ${schema.identity.name.toLowerCase()}`
    : `Update ${schema.identity.name.toLowerCase()} details`;

  const submitLabel = mode === 'create' 
    ? `Create ${schema.identity.name}` 
    : 'Save Changes';

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="border-b p-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex-1 p-6 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
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
            <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{title}</h1>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {formConfig.autosave && isDirty && (
              <span className="text-sm text-muted-foreground">
                {saving ? 'Saving...' : 'Unsaved changes'}
              </span>
            )}
            
            <Button variant="outline" onClick={onCancel} disabled={saving}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            
            <Button 
              onClick={onSave} 
              disabled={saving || !isValid || (!isDirty && mode === 'edit')}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {submitLabel}
            </Button>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Form */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-3xl mx-auto p-6">
            {children}
          </div>
        </main>

        {/* Sidebar */}
        {sidebarContent && (
          <aside className="w-80 border-l bg-muted/30 flex-shrink-0 overflow-auto hidden lg:block">
            <ScrollArea className="h-full">
              <div className="p-4">{sidebarContent}</div>
            </ScrollArea>
          </aside>
        )}
      </div>
    </div>
  );
}

export default FormLayout;
