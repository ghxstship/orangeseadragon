'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EntitySchema, EntityRecord } from '@/lib/schema/types';
import { useCrud } from '../hooks/useCrud';
import { useViewPreference } from '../hooks/useViewPreference';
import { useColumnPreference } from '../hooks/useColumnPreference';
import { ListLayout } from '@/lib/layouts';
import { ViewRenderer } from '@/lib/views/components/ViewRenderer';
import type { ViewType } from '@/lib/data-view-engine/hooks/use-data-view';

interface CrudListProps<T extends EntityRecord = EntityRecord> {
  schema: EntitySchema<T>;
  initialSubpage?: string;
  filter?: Record<string, unknown>;
  editableFields?: string[];
  onCellEdit?: (rowId: string, fieldKey: string, value: unknown) => Promise<void> | void;
}

/**
 * GENERIC LIST COMPONENT
 *
 * Renders ANY entity list based on schema configuration.
 * Uses the unified ListLayout which accepts EntitySchema directly.
 */
export function CrudList<T extends EntityRecord>({
  schema,
  initialSubpage,
  filter,
  editableFields,
  onCellEdit,
}: CrudListProps<T>) {
  const router = useRouter();
  const defaultPageSize = schema.layouts.list.pageSize ?? 20;
  const searchDebounceMs = schema.search.debounce ?? 250;
  const hasDelegatedChildView = !editableFields?.length;
  const [currentSubpage, setCurrentSubpage] = useState(
    initialSubpage || schema.layouts.list.subpages[0]?.key || 'all'
  );
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: defaultPageSize,
  });
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [currentView, setCurrentView] = useViewPreference(
    schema.identity.slug,
    (schema.layouts.list.defaultView || 'table') as ViewType
  );

  // Build column definitions from schema for column preference
  const schemaColumns = (schema.views?.table?.columns ?? []).map((col) => {
    const fieldKey = typeof col === 'string' ? col : col.field;
    const fieldDef = schema.data.fields[fieldKey];
    return {
      id: fieldKey,
      label: fieldDef?.label || fieldKey,
    };
  });

  const { visibleColumnIds } = useColumnPreference(schema.identity.slug, schemaColumns);

  const subpageConfig = schema.layouts.list.subpages.find(s => s.key === currentSubpage);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, searchDebounceMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchDebounceMs, searchInput]);

  const handleSubpageChange = (subpage: string) => {
    setCurrentSubpage(subpage);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSearchChange = (search: string) => {
    setSearchInput(search);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const crud = useCrud(schema, {
    query: {
      ...subpageConfig?.query,
      where: {
        ...subpageConfig?.query?.where,
        ...filter,
      }
    },
    pagination,
    onPaginationChange: setPagination,
    search: hasDelegatedChildView && debouncedSearch.length > 0 ? debouncedSearch : undefined,
  });

  const handleRowClick = (item: T) => {
    const id = (item as Record<string, unknown>)[schema.data.primaryKey || 'id'];
    router.push(`/${schema.identity.slug}/${id}`);
  };

  const handleAction = (actionId: string) => {
    if (actionId === 'create') {
      router.push(`/${schema.identity.slug}/new`);
    }
  };

  return (
    <ListLayout
      schema={schema}
      data={crud.data as T[]}
      loading={crud.loading}
      error={crud.error}
      currentSubpage={currentSubpage}
      onSubpageChange={handleSubpageChange}
      currentView={currentView}
      onViewChange={setCurrentView}
      getRowId={(item) => String((item as Record<string, unknown>)[schema.data.primaryKey || 'id'])}
      onRowClick={handleRowClick}
      onAction={handleAction}
      onRefresh={crud.refetch}
      onCellEdit={onCellEdit}
      editableFields={editableFields}
      searchValue={hasDelegatedChildView ? searchInput : undefined}
      onSearchChange={hasDelegatedChildView ? handleSearchChange : undefined}
    >
      {editableFields?.length ? undefined : (
        <ViewRenderer
          schema={schema}
          viewType={currentView}
          viewConfig={(schema.views as Record<string, unknown>)[currentView] as Record<string, unknown>}
          data={crud.data as T[]}
          loading={crud.loading}
          error={crud.error || undefined}
          selection={crud.selection}
          onSelectionChange={crud.setSelection}
          pagination={crud.pagination}
          onPaginationChange={crud.setPagination}
          sort={crud.sort}
          onSortChange={crud.onSortChange}
          visibleColumns={currentView === 'table' ? visibleColumnIds : undefined}
        />
      )}
    </ListLayout>
  );
}
