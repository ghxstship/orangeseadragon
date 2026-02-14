"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FolderOpen, Plus, ArrowRight, Sparkles } from "lucide-react";
import type { EmptyLayoutConfig } from "./types";

/**
 * EMPTY LAYOUT
 * 
 * Zero-state layout with call-to-action.
 * 2026 Best Practices:
 * - Clear messaging
 * - Visual illustration
 * - Primary action prominent
 * - Helpful suggestions
 */

export interface EmptyLayoutProps {
  config: EmptyLayoutConfig;
  onAction?: (actionId: string) => void;
}

export function EmptyLayout({
  config,
  onAction,
}: EmptyLayoutProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      {/* Illustration */}
      {config.illustration ? (
        <div className="w-48 h-48 mb-8">
          <Image src={config.illustration} alt="" className="w-full h-full object-contain" width={192} height={192} unoptimized />
        </div>
      ) : (
        <div className="w-24 h-24 mb-8 rounded-full bg-muted flex items-center justify-center">
          {config.icon ? (
            <span className="text-4xl">{config.icon}</span>
          ) : (
            <FolderOpen className="h-12 w-12 text-muted-foreground" />
          )}
        </div>
      )}

      {/* Title & Description */}
      <h2 className="text-2xl font-semibold mb-2">{config.title}</h2>
      <p className="text-muted-foreground max-w-md mb-8">{config.description}</p>

      {/* Actions */}
      {config.actions && config.actions.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {config.actions.map((action, index) => (
            <Button
              key={action.id}
              variant={index === 0 ? 'default' : 'outline'}
              size="lg"
              onClick={() => onAction?.(action.id)}
            >
              {index === 0 && <Plus className="h-4 w-4 mr-2" />}
              {action.label}
            </Button>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {config.suggestions && config.suggestions.length > 0 && (
        <div className="w-full max-w-lg">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            <Sparkles className="h-4 w-4 inline mr-2" />
            Getting Started
          </h3>
          <div className="space-y-3">
            {config.suggestions.map((suggestion) => (
              <button
                key={suggestion.action.id}
                onClick={() => onAction?.(suggestion.action.id)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-lg border text-left",
                  "hover:bg-accent transition-colors"
                )}
              >
                <div className="flex-1">
                  <div className="font-medium">{suggestion.title}</div>
                  <div className="text-sm text-muted-foreground">{suggestion.description}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default EmptyLayout;
