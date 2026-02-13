'use client';

import { useEffect } from 'react';

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
      <body className="bg-zinc-950 text-white flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6 max-w-md px-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
            <p className="mt-2 text-sm text-zinc-400">
              An unexpected error occurred. Our team has been notified.
            </p>
            {error.digest && (
              <p className="mt-1 text-xs text-zinc-600 font-mono">
                Error ID: {error.digest}
              </p>
            )}
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={reset}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 transition-colors"
            >
              Try again
            </button>
            <a
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
