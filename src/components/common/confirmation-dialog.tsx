"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

/**
 * Themed confirmation dialog replacing window.confirm().
 *
 * - Fully styled via design tokens (white-label safe)
 * - Accessible: focus trap, screen reader announcements, keyboard nav
 * - Supports async confirm actions with loading state
 */
export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmationDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch {
      // Let the caller handle errors
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const busy = loading || isLoading;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={busy}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={busy}
            className={cn(
              variant === "destructive" &&
                buttonVariants({ variant: "destructive" })
            )}
          >
            {busy ? "Processing\u2026" : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Hook that provides a promise-based confirmation dialog.
 *
 * Usage:
 *   const { confirm, ConfirmDialog } = useConfirmation();
 *   const ok = await confirm({ title: "Delete?", description: "..." });
 *   if (ok) { ... }
 *
 * Render <ConfirmDialog /> somewhere in your component tree.
 */
export function useConfirmation() {
  const [state, setState] = React.useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "default" | "destructive";
    resolve?: (value: boolean) => void;
  }>({ open: false, title: "", description: "" });

  const confirm = React.useCallback(
    (opts: {
      title: string;
      description: string;
      confirmLabel?: string;
      cancelLabel?: string;
      variant?: "default" | "destructive";
    }): Promise<boolean> => {
      return new Promise((resolve) => {
        setState({ ...opts, open: true, resolve });
      });
    },
    []
  );

  const handleConfirm = React.useCallback(() => {
    state.resolve?.(true);
    setState((s) => ({ ...s, open: false }));
  }, [state]);

  const handleCancel = React.useCallback(() => {
    state.resolve?.(false);
    setState((s) => ({ ...s, open: false }));
  }, [state]);

  const ConfirmDialog = React.useCallback(
    () => (
      <ConfirmationDialog
        open={state.open}
        onOpenChange={(open) => {
          if (!open) handleCancel();
        }}
        title={state.title}
        description={state.description}
        confirmLabel={state.confirmLabel}
        cancelLabel={state.cancelLabel}
        variant={state.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    ),
    [state, handleConfirm, handleCancel]
  );

  return { confirm, ConfirmDialog };
}
