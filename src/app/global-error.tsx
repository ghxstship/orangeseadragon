'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { PageErrorState } from '@/components/common/contextual-empty-state';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-background text-foreground flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md px-6 space-y-3">
          <PageErrorState
            title="Something went wrong"
            description="An unexpected error occurred. Please try again or contact support if the issue persists."
            error={error}
            onRetry={reset}
            className="min-h-[16rem]"
          />

          <div className="space-y-2 text-center">
            {error.digest && (
              <p className="text-xs text-muted-foreground/70 font-mono">
                Error ID: {error.digest}
              </p>
            )}

            <Button variant="outline" size="sm" asChild>
              <Link href="/core/dashboard">
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
