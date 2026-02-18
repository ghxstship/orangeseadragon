import type { ActionDefinition, EntitySchema, EntityRecord } from '@/lib/schema-engine/types';
import { captureError } from '@/lib/observability';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- matches useToast/useConfirmation signatures
type ToastFn = (...args: any[]) => any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- matches useConfirmation signature
type ConfirmFn = (opts: any) => Promise<boolean>;

interface DispatchContext {
  record?: EntityRecord | null;
  selectedIds?: string[];
  schema: EntitySchema<EntityRecord>;
  router: { push: (path: string) => void };
  refresh: () => void;
  toast: ToastFn;
  confirm: ConfirmFn;
}

function resolveEndpoint(endpoint: string, record?: EntityRecord | null): string {
  if (!record) return endpoint;
  const id = String((record as Record<string, unknown>).id ?? '');
  return endpoint.replace('{id}', id);
}

export async function dispatchAction(
  actionId: string,
  context: DispatchContext
): Promise<boolean> {
  const { schema, record, selectedIds, router, refresh, toast, confirm } = context;

  const allActions = [
    ...(schema.actions?.row ?? []),
    ...(schema.actions?.bulk ?? []),
    ...(schema.actions?.global ?? []),
  ];

  const action = allActions.find((a: ActionDefinition) => a.key === actionId);
  if (!action) {
    if (actionId === 'create') {
      router.push(`/${schema.identity.slug}/new`);
      return true;
    }
    return false;
  }

  if (action.confirm) {
    const message =
      typeof action.confirm.message === 'function'
        ? action.confirm.message(record)
        : action.confirm.message;

    const confirmed = await confirm({
      title: action.confirm.title,
      description: message,
      confirmLabel: action.confirm.confirmLabel || 'Confirm',
      variant: action.variant === 'destructive' ? 'destructive' : undefined,
    });

    if (!confirmed) return false;
  }

  const { handler } = action;

  switch (handler.type) {
    case 'navigate': {
      const path =
        typeof handler.path === 'function' ? handler.path(record) : handler.path;
      router.push(path);
      return true;
    }

    case 'api': {
      try {
        const endpoint = resolveEndpoint(handler.endpoint, record);
        const body: Record<string, unknown> = {};

        if (record) {
          body.id = (record as Record<string, unknown>).id;
        }
        if (selectedIds?.length) {
          body.ids = selectedIds;
        }

        const res = await fetch(endpoint, {
          method: handler.method || 'POST',
          headers: { 'Content-Type': 'application/json' },
          ...(handler.method !== 'GET' ? { body: JSON.stringify(body) } : {}),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            errData.error?.message || `Action failed (${res.status})`
          );
        }

        toast({
          title: action.successMessage || 'Action completed',
          description: `${action.label} completed successfully`,
        });

        refresh();
        return true;
      } catch (err) {
        captureError(err, `crud.action-dispatch.${actionId}`);
        toast({
          title: action.errorMessage || 'Action failed',
          description: err instanceof Error ? err.message : 'An unexpected error occurred',
          variant: 'destructive',
        });
        return false;
      }
    }

    case 'function': {
      try {
        await handler.fn(record, {
          user: null,
          selectedIds,
          refresh,
        });
        return true;
      } catch (err) {
        captureError(err, `crud.action-dispatch.fn.${actionId}`);
        toast({
          title: action.errorMessage || 'Action failed',
          description: err instanceof Error ? err.message : 'An unexpected error occurred',
          variant: 'destructive',
        });
        return false;
      }
    }

    case 'external': {
      const url =
        typeof handler.url === 'function' ? handler.url(record) : handler.url;
      window.open(url, '_blank', 'noopener,noreferrer');
      return true;
    }

    case 'modal': {
      return false;
    }

    default:
      return false;
  }
}
