'use client';

import { use } from 'react';
import { CrudForm } from '@/lib/crud/components/CrudForm';
import { connectionSchema } from '@/lib/schemas/crm/connection';

export default function EditConnectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <CrudForm schema={connectionSchema} mode="edit" id={id} />;
}
