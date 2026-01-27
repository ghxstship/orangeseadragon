'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EntitySchema } from '@/lib/schema/types';
import { useCrud } from '../hooks/useCrud';
import { useViewPreference } from '../hooks/useViewPreference';
import { ListLayout } from '@/lib/layouts';
import { ViewRenderer } from '@/lib/views/components/ViewRenderer';

interface CrudListProps<T = Record<string, unknown>> {
  schema: EntitySchema<T>;
  initialSubpage?: string;
  filter?: Record<string, unknown>;
}

/**
 * GENERIC LIST COMPONENT
 *
 * Renders ANY entity list based on schema configuration.
 * Uses the unified ListLayout which accepts EntitySchema directly.
 */
export function CrudList<T extends Record<string, unknown>>({ 
  schema, 
  initialSubpage, 
  filter 
}: CrudListProps<T>) {
  const router = useRouter();
  const [currentSubpage, setCurrentSubpage] = useState(
    initialSubpage || schema.layouts.list.subpages[0]?.key || 'all'
  );

  const [currentView, setCurrentView] = useViewPreference(
    schema.identity.slug,
    schema.layouts.list.defaultView
  );

  const subpageConfig = schema.layouts.list.subpages.find(s => s.key === currentSubpage);

  const crud = useCrud(schema, {
    query: {
      ...subpageConfig?.query,
      where: {
        ...subpageConfig?.query?.where,
        ...filter,
      }
    },
  });

  const handleRowClick = (item: T) => {
    const id = (item as Record<string, unknown>)[schema.data.primaryKey || 'id'];
    router.push(`/${schema.identity.slug}/${id}`);
  };

  const handleAction = (actionId: string, payload?: unknown) => {
    if (actionId === 'create') {
      router.push(`/${schema.identity.slug}/new`);
    }
    // Handle other actions as needed
  };

  return (
    <ListLayout
      schema={schema}
      data={crud.data as T[]}
      loading={crud.loading}
      error={crud.error}
      currentSubpage={currentSubpage}
      onSubpageChange={setCurrentSubpage}
      currentView={currentView}
      onViewChange={setCurrentView}
      getRowId={(item) => String((item as Record<string, unknown>)[schema.data.primaryKey || 'id'])}
      onRowClick={handleRowClick}
      onAction={handleAction}
      onRefresh={crud.refetch}
    >
      <ViewRenderer
        schema={schema}
        viewType={currentView}
        viewConfig={(schema.views as Record<string, unknown>)[currentView]}
        data={crud.data}
        loading={crud.loading}
        error={crud.error}
        selection={crud.selection}
        onSelectionChange={crud.setSelection}
        pagination={crud.pagination}
        onPaginationChange={crud.setPagination}
        sort={crud.sort}
        onSortChange={crud.onSortChange}
      />
    </ListLayout>
  );
}
