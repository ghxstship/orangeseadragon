'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EntitySchema } from '@/lib/schema/types';
import { useCrud } from '../hooks/useCrud';
import { DetailLayout } from '@/lib/layouts';
import { TabRenderer } from './TabRenderer';
import { LoadingState, ErrorState, EmptyState } from '@/components/states/AsyncStates';

interface CrudDetailProps<T = Record<string, unknown>> {
  schema: EntitySchema<T>;
  id: string;
  initialTab?: string;
}

/**
 * GENERIC DETAIL COMPONENT
 *
 * Renders ANY entity detail view based on schema configuration.
 * Uses the unified DetailLayout which accepts EntitySchema directly.
 */
export function CrudDetail<T extends Record<string, unknown>>({ 
  schema, 
  id, 
  initialTab 
}: CrudDetailProps<T>) {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState(initialTab || schema.layouts.detail.tabs[0]?.key || 'overview');
  const crud = useCrud(schema);
  const { data: record, isLoading: loading, error, refetch: refresh } = crud.useRecord(id);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState description={error.message} retry={refresh} />;
  if (!record) return <EmptyState title="Record Not Found" description={`The requested ${schema.identity.name} could not be found.`} />;

  const tabConfig = schema.layouts.detail.tabs.find(t => t.key === currentTab) || schema.layouts.detail.tabs[0];

  const handleBack = () => {
    router.push(`/${schema.identity.slug}`);
  };

  const handleEdit = () => {
    router.push(`/${schema.identity.slug}/${id}/edit`);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(`Are you sure you want to delete this ${schema.identity.name}? This action cannot be undone.`);
    if (confirmed) {
      try {
        await crud.delete(id);
        router.push(`/${schema.identity.slug}`);
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  return (
    <DetailLayout
      schema={schema}
      record={record as T}
      loading={loading}
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      onBack={handleBack}
      onEdit={handleEdit}
      onDelete={handleDelete}
    >
      <TabRenderer
        schema={schema}
        tabConfig={tabConfig}
        record={record}
        onRefresh={refresh}
      />
    </DetailLayout>
  );
}
