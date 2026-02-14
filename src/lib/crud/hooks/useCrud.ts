import { useMemo } from 'react';
import { EntitySchema } from '@/lib/schema/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { throwApiErrorResponse } from '@/lib/api/error-message';

/**
 * GENERIC CRUD HOOK
 *
 * Handles data operations for ANY entity based on schema.
 * NEVER add entity-specific logic here.
 */
export function useCrud<T = any>(schema: EntitySchema<T>, options?: CrudOptions) {
  const queryClient = useQueryClient();
  const endpoint = schema.data.endpoint;

  // Build query params from options
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    if (options?.query?.where) {
      params.set('where', JSON.stringify(options.query.where));
    }
    if (options?.query?.orderBy) {
      params.set('orderBy', JSON.stringify(options.query.orderBy));
    }
    if (options?.pagination) {
      params.set('page', String(options.pagination.page));
      params.set('pageSize', String(options.pagination.pageSize));
    }
    if (options?.search) {
      params.set('search', options.search);
    }

    return params.toString();
  }, [options]);

  // List query
  const listQuery = useQuery({
    queryKey: [schema.identity.slug, 'list', queryParams],
    queryFn: async () => {
      const url = queryParams ? `${endpoint}?${queryParams}` : endpoint;
      const res = await fetch(url);
      if (!res.ok) {
        await throwApiErrorResponse(res, `Failed to load ${schema.identity.namePlural}`);
      }
      return res.json();
    },
  });

  // Single record hook
  const useRecord = (id: string) => {
    return useQuery({
      queryKey: [schema.identity.slug, 'record', id],
      queryFn: async () => {
        const res = await fetch(`${endpoint}/${id}`);
        if (!res.ok) {
          await throwApiErrorResponse(res, `Failed to load ${schema.identity.name}`);
        }
        return res.json();
      },
    });
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: Partial<T>) => {
      // Apply beforeCreate hook
      let processedData = data;
      if (schema.hooks?.beforeCreate) {
        processedData = await schema.hooks.beforeCreate(data);
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData),
      });

      if (!res.ok) {
        await throwApiErrorResponse(res, `Failed to create ${schema.identity.name}`);
      }
      return res.json();
    },
    onSuccess: async (record) => {
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: [schema.identity.slug, 'list'] });

      // Apply afterCreate hook
      if (schema.hooks?.afterCreate) {
        await schema.hooks.afterCreate(record);
      }
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<T> }) => {
      // Apply beforeUpdate hook
      let processedData = data;
      if (schema.hooks?.beforeUpdate) {
        const existing = queryClient.getQueryData([schema.identity.slug, 'record', id]);
        processedData = await schema.hooks.beforeUpdate(id, data, existing as T);
      }

      const res = await fetch(`${endpoint}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData),
      });

      if (!res.ok) {
        await throwApiErrorResponse(res, `Failed to update ${schema.identity.name}`);
      }
      return res.json();
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSuccess: async (record, { id, data }) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: [schema.identity.slug] });

      // Apply afterUpdate hook
      if (schema.hooks?.afterUpdate) {
        await schema.hooks.afterUpdate(record, data);
      }
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Apply beforeDelete hook
      if (schema.hooks?.beforeDelete) {
        const record = queryClient.getQueryData([schema.identity.slug, 'record', id]);
        const canDelete = await schema.hooks.beforeDelete(id, record as T);
        if (!canDelete) {
          throw new Error('Delete prevented by hook');
        }
      }

      const res = await fetch(`${endpoint}/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        await throwApiErrorResponse(res, `Failed to delete ${schema.identity.name}`);
      }
      return id;
    },
    onSuccess: async (id) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: [schema.identity.slug] });

      // Apply afterDelete hook
      if (schema.hooks?.afterDelete) {
        await schema.hooks.afterDelete(id);
      }
    },
  });

  return {
    // List data
    data: listQuery.data?.records || [],
    total: listQuery.data?.total || 0,
    loading: listQuery.isLoading,
    error: listQuery.error,
    refetch: listQuery.refetch,

    // Single record
    useRecord,

    // Mutations
    create: createMutation.mutateAsync,
    update: (id: string, data: Partial<T>) => updateMutation.mutateAsync({ id, data }),
    delete: deleteMutation.mutateAsync,

    // Mutation states
    creating: createMutation.isPending,
    updating: updateMutation.isPending,
    deleting: deleteMutation.isPending,

    // Selection state (for bulk actions)
    selection: options?.selection || [],
    setSelection: options?.onSelectionChange,

    // Pagination state
    pagination: options?.pagination,
    setPagination: options?.onPaginationChange,

    // Sort state
    sort: options?.sort,
    onSortChange: options?.onSortChange,
  };
}

interface CrudOptions {
  query?: {
    where?: Record<string, any>;
    orderBy?: { field: string; direction: 'asc' | 'desc' };
  };
  pagination?: {
    page: number;
    pageSize: number;
  };
  onPaginationChange?: (pagination: any) => void;
  search?: string;
  sort?: { field: string; direction: 'asc' | 'desc' };
  onSortChange?: (sort: any) => void;
  selection?: string[];
  onSelectionChange?: (ids: string[]) => void;
}
