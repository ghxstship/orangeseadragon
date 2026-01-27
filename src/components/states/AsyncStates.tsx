"use client";

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Inbox, Plus } from 'lucide-react';

interface LoadingStateProps {
  variant?: 'skeleton' | 'spinner' | 'card';
  count?: number;
  className?: string;
}

export function LoadingState({
  variant = 'skeleton',
  count = 1,
  className
}: LoadingStateProps) {
  if (variant === 'spinner') {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default skeleton
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className
}: EmptyStateProps) {
  const defaultIcon = <Inbox className="h-12 w-12 text-muted-foreground" />;

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      {icon || defaultIcon}
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <Button
          variant={action.variant || 'default'}
          onClick={action.onClick}
          className="mt-4"
        >
          {action.variant === 'outline' && <Plus className="h-4 w-4 mr-2" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  retry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We encountered an error while loading this content. Please try again.",
  retry,
  className
}: ErrorStateProps) {
  return (
    <Alert className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-2">
          <p className="font-medium">{title}</p>
          <p className="text-sm">{description}</p>
          {retry && (
            <Button
              variant="outline"
              size="sm"
              onClick={retry}
              className="mt-2"
            >
              Try Again
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

// Higher-order component for handling loading/error/empty states
interface AsyncStateWrapperProps<T> {
  data: T[] | undefined;
  loading: boolean;
  error: Error | null;
  emptyState?: Omit<EmptyStateProps, 'className'>;
  loadingVariant?: LoadingStateProps['variant'];
  loadingCount?: number;
  retry?: () => void;
  children: (data: T[]) => React.ReactNode;
  className?: string;
}

export function AsyncStateWrapper<T>({
  data,
  loading,
  error,
  emptyState,
  loadingVariant = 'card',
  loadingCount = 3,
  retry,
  children,
  className
}: AsyncStateWrapperProps<T>) {
  if (loading) {
    return <LoadingState variant={loadingVariant} count={loadingCount} className={className} />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load data"
        description={error.message}
        retry={retry}
        className={className}
      />
    );
  }

  if (!data || data.length === 0) {
    if (emptyState) {
      return <EmptyState {...emptyState} className={className} />;
    }
    return (
      <EmptyState
        title="No data found"
        description="There are no items to display at the moment."
        className={className}
      />
    );
  }

  return <>{children(data)}</>;
}

// Hook for managing async state
export function useAsyncState<T>() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [data, setData] = React.useState<T[] | undefined>(undefined);

  const execute = React.useCallback(async (asyncFn: () => Promise<T[]>) => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = React.useCallback(() => {
    setLoading(false);
    setError(null);
    setData(undefined);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData,
    setError
  };
}
