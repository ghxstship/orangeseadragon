'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { PageErrorState } from '@/components/common/contextual-empty-state';
import { captureError } from '@/lib/observability';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureError(error, 'app.errorBoundary');
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-6">
      <div className="w-full max-w-md space-y-3">
        <PageErrorState
          title="Something went wrong"
          description="An error occurred while loading this page. You can try again or return to the dashboard."
          error={error}
          onRetry={reset}
          className="min-h-[16rem]"
        />

        <div className="space-y-2 text-center">
          {error.digest && (
            <p className="text-xs text-muted-foreground/50 font-mono">
              Error ID: {error.digest}
            </p>
          )}

          <Button variant="outline" size="sm" asChild>
            <Link href="/core/dashboard">
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
