import { useMemo } from 'react';
import { EntityRecord, EntitySchema } from '@/lib/schema-engine/types';
import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { throwApiErrorResponse } from '@/lib/api/error-message';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

interface CrudListResponse<T extends EntityRecord> {
  records: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function clampPageSize(pageSize: number): number {
  if (!Number.isFinite(pageSize)) return DEFAULT_PAGE_SIZE;
  return Math.min(Math.max(pageSize, 1), MAX_PAGE_SIZE);
}

function normalizeListResponse<T extends EntityRecord>(
  payload: unknown,
  fallbackPage: number,
  fallbackPageSize: number
): CrudListResponse<T> {
  if (!payload || typeof payload !== 'object') {
    return {
      records: [],
      total: 0,
      page: fallbackPage,
      pageSize: fallbackPageSize,
      totalPages: 0,
    };
  }

  const body = payload as {
    data?: unknown;
    meta?: Record<string, unknown>;
    records?: unknown;
    total?: unknown;
    page?: unknown;
    pageSize?: unknown;
  };

  const records = Array.isArray(body.data)
    ? (body.data as T[])
    : Array.isArray(body.records)
      ? (body.records as T[])
      : [];

  const meta = body.meta && typeof body.meta === 'object'
    ? body.meta
    : undefined;

  const totalCandidate = meta?.total ?? body.total;
  const pageCandidate = meta?.page ?? body.page;
  const pageSizeCandidate = meta?.limit ?? body.pageSize;
  const totalPagesCandidate = meta?.totalPages;

  const parsedTotal = Number(totalCandidate);
  const parsedPage = Number(pageCandidate);
  const parsedPageSize = Number(pageSizeCandidate);
  const parsedTotalPages = Number(totalPagesCandidate);

  const total = Number.isFinite(parsedTotal) ? parsedTotal : records.length;
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : fallbackPage;
  const pageSize = clampPageSize(
    Number.isFinite(parsedPageSize) ? parsedPageSize : fallbackPageSize
  );
  const totalPages = Number.isFinite(parsedTotalPages) && parsedTotalPages >= 0
    ? parsedTotalPages
    : Math.ceil(total / Math.max(pageSize, 1));

  return {
    records,
    total,
    page,
    pageSize,
    totalPages,
  };
}

function resolveProjectionFields<T extends EntityRecord>(schema: EntitySchema<T>): string[] | null {
  const hasDynamicDisplayDependencies = [
    schema.display.title,
    schema.display.subtitle,
    schema.display.description,
    schema.display.image,
    schema.display.icon,
    schema.display.badge,
  ].some((entry) => typeof entry === 'function');

  if (hasDynamicDisplayDependencies) {
    return null;
  }

  const availableFieldSet = new Set(Object.keys(schema.data.fields));
  const projectionFields = new Set<string>();

  const addField = (field: string | undefined) => {
    if (field && availableFieldSet.has(field)) {
      projectionFields.add(field);
    }
  };

  schema.views.table?.columns.forEach((column) => {
    addField(typeof column === 'string' ? column : column.field);
  });

  if (schema.views.list) {
    addField(schema.views.list.titleField);
    addField(schema.views.list.subtitleField);
    addField(schema.views.list.descriptionField);
    addField(schema.views.list.avatarField);
    addField(schema.views.list.badgeField);
    schema.views.list.metaFields?.forEach(addField);
  }

  if (schema.views.grid) {
    addField(schema.views.grid.titleField);
    addField(schema.views.grid.subtitleField);
    addField(schema.views.grid.imageField);
    addField(schema.views.grid.badgeField);
    schema.views.grid.cardFields.forEach(addField);
  }

  if (schema.views.kanban) {
    addField(schema.views.kanban.columnField);
    if (typeof schema.views.kanban.card.title === 'string') {
      addField(schema.views.kanban.card.title);
    }
    if (typeof schema.views.kanban.card.subtitle === 'string') {
      addField(schema.views.kanban.card.subtitle);
    }
    addField(schema.views.kanban.card.image);
    schema.views.kanban.card.fields?.forEach(addField);
  }

  if (schema.views.calendar) {
    addField(schema.views.calendar.startField);
    addField(schema.views.calendar.endField);
    addField(schema.views.calendar.titleField);
    addField(schema.views.calendar.allDayField);
    addField(schema.views.calendar.colorField);
    addField(schema.views.calendar.resourceField);
  }

  if (schema.views.timeline) {
    addField(schema.views.timeline.startField);
    addField(schema.views.timeline.endField);
    addField(schema.views.timeline.titleField);
    addField(schema.views.timeline.groupField);
    addField(schema.views.timeline.progressField);
    addField(schema.views.timeline.dependencyField);
    addField(schema.views.timeline.milestoneField);
  }

  if (schema.views.gallery) {
    addField(schema.views.gallery.imageField);
    addField(schema.views.gallery.titleField);
    addField(schema.views.gallery.subtitleField);
    addField(schema.views.gallery.badgeField);
  }

  if (schema.views.map) {
    addField(schema.views.map.latitudeField);
    addField(schema.views.map.longitudeField);
    addField(schema.views.map.titleField);
    if (typeof schema.views.map.markerIcon === 'string') {
      addField(schema.views.map.markerIcon);
    }
    if (typeof schema.views.map.markerColor === 'string') {
      addField(schema.views.map.markerColor);
    }
  }

  schema.search.fields.forEach(addField);
  addField(schema.display.defaultSort.field);

  schema.layouts.list.subpages.forEach((subpage) => {
    Object.keys(subpage.query.where ?? {}).forEach(addField);
    addField(subpage.query.orderBy?.field);
  });

  return projectionFields.size > 0 ? Array.from(projectionFields).sort() : null;
}

/**
 * GENERIC CRUD HOOK
 *
 * Handles data operations for ANY entity based on schema.
 * NEVER add entity-specific logic here.
 */
export function useCrud<T extends EntityRecord = EntityRecord>(schema: EntitySchema<T>, options?: CrudOptions) {
  const queryClient = useQueryClient();
  const endpoint = schema.data.endpoint;
  const projectionFields = useMemo(() => resolveProjectionFields(schema), [schema]);

  const pagination = useMemo(() => {
    const configuredPageSize = schema.layouts.list.pageSize ?? DEFAULT_PAGE_SIZE;
    const pageSize = clampPageSize(options?.pagination?.pageSize ?? configuredPageSize);
    const page = Number.isFinite(options?.pagination?.page)
      ? Math.max(options?.pagination?.page ?? DEFAULT_PAGE, DEFAULT_PAGE)
      : DEFAULT_PAGE;

    return { page, pageSize };
  }, [options?.pagination?.page, options?.pagination?.pageSize, schema.layouts.list.pageSize]);

  // Build query params from options
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    if (options?.query?.where) {
      params.set('where', JSON.stringify(options.query.where));
    }

    const orderBy = options?.sort ?? options?.query?.orderBy;
    if (orderBy) {
      params.set('orderBy', JSON.stringify(orderBy));
    }

    params.set('page', String(pagination.page));
    params.set('pageSize', String(pagination.pageSize));

    if (projectionFields && projectionFields.length > 0) {
      params.set('fields', projectionFields.join(','));
    }

    if (options?.search) {
      params.set('search', options.search);
    }

    return params.toString();
  }, [
    options?.query?.where,
    options?.query?.orderBy,
    options?.sort,
    options?.search,
    pagination.page,
    pagination.pageSize,
    projectionFields,
  ]);

  // List query
  const listQuery = useQuery<CrudListResponse<T>>({
    queryKey: [schema.identity.slug, 'list', queryParams],
    queryFn: async () => {
      const url = queryParams ? `${endpoint}?${queryParams}` : endpoint;
      const res = await fetch(url);
      if (!res.ok) {
        await throwApiErrorResponse(res, `Failed to load ${schema.identity.namePlural}`);
      }
      const payload = await res.json();
      return normalizeListResponse<T>(payload, pagination.page, pagination.pageSize);
    },
    placeholderData: keepPreviousData,
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
    data: listQuery.data?.records ?? [],
    total: listQuery.data?.total ?? 0,
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
    pagination: {
      page: listQuery.data?.page ?? pagination.page,
      pageSize: listQuery.data?.pageSize ?? pagination.pageSize,
      total: listQuery.data?.total ?? 0,
      totalPages: listQuery.data?.totalPages ?? 0,
    },
    setPagination: options?.onPaginationChange,

    // Sort state
    sort: options?.sort,
    onSortChange: options?.onSortChange,
  };
}

interface CrudOptions {
  query?: {
    where?: Record<string, unknown>;
    orderBy?: { field: string; direction: 'asc' | 'desc' };
  };
  pagination?: {
    page: number;
    pageSize: number;
  };
  onPaginationChange?: (pagination: { page: number; pageSize: number }) => void;
  search?: string;
  sort?: { field: string; direction: 'asc' | 'desc' };
  onSortChange?: (sort: { field: string; direction: 'asc' | 'desc' }) => void;
  selection?: string[];
  onSelectionChange?: (ids: string[]) => void;
}
