"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import type { ErrorLayoutConfig } from "./types";

/**
 * ERROR LAYOUT
 * 
 * Error recovery layout.
 * 2026 Best Practices:
 * - Clear error messaging
 * - Recovery actions
 * - Optional technical details
 * - Friendly tone
 */

export interface ErrorLayoutProps {
  config: ErrorLayoutConfig;
  error?: Error;
  onAction?: (actionId: string) => void;
  onRetry?: () => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
}

export function ErrorLayout({
  config,
  error,
  onAction,
  onRetry,
  onGoBack,
  onGoHome,
}: ErrorLayoutProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      {/* Illustration */}
      {config.illustration ? (
        <div className="w-48 h-48 mb-8">
          <Image src={config.illustration} alt="" className="w-full h-full object-contain" width={192} height={192} unoptimized />
        </div>
      ) : (
        <div className="w-24 h-24 mb-8 rounded-full bg-destructive/10 flex items-center justify-center">
          {config.icon ? (
            <span className="text-4xl">{config.icon}</span>
          ) : (
            <AlertCircle className="h-12 w-12 text-destructive" />
          )}
        </div>
      )}

      {/* Error Code */}
      {config.code && (
        <div className="text-6xl font-bold text-muted-foreground/50 mb-4">
          {config.code}
        </div>
      )}

      {/* Title & Description */}
      <h2 className="text-2xl font-semibold mb-2">{config.title}</h2>
      <p className="text-muted-foreground max-w-md mb-8">{config.description}</p>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        {onRetry && (
          <Button onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
        {onGoBack && (
          <Button variant="outline" onClick={onGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        )}
        {onGoHome && (
          <Button variant="outline" onClick={onGoHome}>
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        )}
        {config.actions?.map((action) => (
          <Button
            key={action.id}
            variant={action.variant || 'outline'}
            onClick={() => onAction?.(action.id)}
          >
            {action.label}
          </Button>
        ))}
      </div>

      {/* Technical Details */}
      {(config.showDetails || config.showStackTrace) && error && (
        <div className="w-full max-w-lg">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
          >
            {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showDetails ? 'Hide' : 'Show'} technical details
          </button>

          {showDetails && (
            <div className="mt-4 p-4 rounded-lg bg-muted text-left">
              {config.showDetails && (
                <div className="mb-4">
                  <div className="text-xs font-medium text-muted-foreground mb-1">Error Message</div>
                  <div className="text-sm font-mono">{error.message}</div>
                </div>
              )}
              {config.showStackTrace && error.stack && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Stack Trace</div>
                  <pre className="text-xs font-mono overflow-auto max-h-48 whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ErrorLayout;
