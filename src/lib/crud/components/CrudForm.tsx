'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EntitySchema, EntityRecord } from '@/lib/schema-engine/types';
import { useCrud } from '../hooks/useCrud';
import { FormLayout } from '@/lib/layouts';
import { DynamicForm } from './DynamicForm';
import { useToast } from '@/components/ui/use-toast';

interface CrudFormProps<T extends EntityRecord = EntityRecord> {
  schema: EntitySchema<T>;
  mode: 'create' | 'edit';
  id?: string;
}

/**
 * GENERIC FORM COMPONENT
 *
 * Renders ANY entity create/edit form based on schema configuration.
 * Uses the unified FormLayout which accepts EntitySchema directly.
 */
export function CrudForm<T extends EntityRecord>({
  schema,
  mode,
  id
}: CrudFormProps<T>) {
  const crud = useCrud(schema);
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const recordQuery = mode === 'edit' && id ? crud.useRecord(id) : null;
  const record = recordQuery?.data;
  const recordLoading = recordQuery?.isLoading ?? false;

  const handleSubmit = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      if (mode === 'create') {
        const created = await crud.create(data as Partial<T>);
        toast({
          title: `${schema.identity.name} created`,
          description: 'Successfully created the record.',
        });
        router.push(`/${schema.identity.slug}/${(created as { id: string }).id}`);
      } else {
        await crud.update(id!, data as Partial<T>);
        toast({
          title: `${schema.identity.name} updated`,
          description: 'Successfully updated the record.',
        });
        router.push(`/${schema.identity.slug}/${id}`);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${mode} ${schema.identity.name}`,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleSave = () => {
    // Trigger form submission - the DynamicForm handles the actual submit
    const form = document.querySelector('form');
    form?.requestSubmit();
  };

  return (
    <FormLayout
      schema={schema}
      mode={mode}
      loading={recordLoading}
      saving={saving}
      onSave={handleSave}
      onCancel={handleCancel}
    >
      <DynamicForm
        schema={schema as unknown as EntitySchema<EntityRecord>}
        mode={mode}
        initialData={record as T}
        onSubmit={handleSubmit}
        autosave={schema.layouts.form.autosave}
      />
    </FormLayout>
  );
}
