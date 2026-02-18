'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EntitySchema, EntityRecord } from '@/lib/schema-engine/types';
import { useCrud } from '../hooks/useCrud';
import { DetailLayout } from '@/lib/layouts';
import { TabRenderer } from './TabRenderer';
import { SidebarRenderer } from './SidebarRenderer';
import { LoadingState, ErrorState, EmptyState } from '@/components/states/AsyncStates';
import { useConfirmation } from '@/components/common/confirmation-dialog';
import { useToast } from '@/components/ui/use-toast';
import { getErrorMessage } from '@/lib/api/error-message';
import { captureError } from '@/lib/observability';
import { dispatchAction } from '../utils/action-dispatch';

interface CrudDetailProps<T extends EntityRecord = EntityRecord> {
  schema: EntitySchema<T>;
  id: string;
  initialTab?: string;
}

/**
 * GENERIC DETAIL COMPONENT
 *
 * Renders ANY entity detail view based on schema configuration.
 * Uses the unified DetailLayout which accepts EntitySchema directly.
 * Renders sidebar content from schema.layouts.detail.sidebar config.
 */
export function CrudDetail<T extends EntityRecord>({
  schema,
  id,
  initialTab
}: CrudDetailProps<T>) {
  const router = useRouter();
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState(initialTab || schema.layouts.detail.tabs[0]?.key || 'overview');
  const crud = useCrud(schema);
  const { data: record, isLoading: loading, error, refetch: refresh } = crud.useRecord(id);
  const { confirm, ConfirmDialog } = useConfirmation();

  if (loading) return <LoadingState />;
  if (error) {
    return <ErrorState description={getErrorMessage(error, `Failed to load ${schema.identity.name}`)} retry={refresh} />;
  }
  if (!record) return <EmptyState title="Record Not Found" description={`The requested ${schema.identity.name} could not be found.`} />;

  const tabConfig = schema.layouts.detail.tabs.find(t => t.key === currentTab) || schema.layouts.detail.tabs[0];

  const handleBack = () => {
    router.push(`/${schema.identity.slug}`);
  };

  const handleEdit = () => {
    router.push(`/${schema.identity.slug}/${id}/edit`);
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: `Delete ${schema.identity.name}`,
      description: `Are you sure you want to delete this ${schema.identity.name}? This action cannot be undone.`,
      confirmLabel: "Delete",
      variant: "destructive",
    });
    if (confirmed) {
      try {
        await crud.delete(id);
        router.push(`/${schema.identity.slug}`);
      } catch (err) {
        captureError(err, 'crud.components.CrudDetail.error');
      }
    }
  };

  const handleAction = async (actionId: string) => {
    await dispatchAction(actionId, {
      schema: schema as unknown as EntitySchema<EntityRecord>,
      record: record as EntityRecord,
      router,
      refresh,
      toast,
      confirm,
    });
  };

  const sidebarConfig = schema.layouts.detail.sidebar;

  return (
    <>
      <ConfirmDialog />
      <DetailLayout
        schema={schema}
        record={record as T}
        loading={loading}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onBack={handleBack}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAction={handleAction}
        sidebarContent={
          sidebarConfig ? (
            <SidebarRenderer
              schema={schema as unknown as EntitySchema<EntityRecord>}
              record={record}
              onTabChange={setCurrentTab}
            />
          ) : undefined
        }
      >
        <TabRenderer
          schema={schema as unknown as EntitySchema<EntityRecord>}
          tabConfig={tabConfig}
          record={record}
          onRefresh={refresh}
        />
      </DetailLayout>
    </>
  );
}
