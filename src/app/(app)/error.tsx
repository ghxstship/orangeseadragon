'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[AppError]', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-destructive" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Something went wrong</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            An error occurred while loading this page. You can try again or return to the dashboard.
          </p>
          {error.digest && (
            <p className="mt-1 text-xs text-muted-foreground/50 font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset} variant="default" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Try again
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/dashboard">
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
