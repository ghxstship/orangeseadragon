'use client';

import { use } from 'react';
import { CrudForm } from '@/lib/crud/components/CrudForm';
import { workflowSchema } from '@/lib/schemas/workflows/workflow';

export default function EditWorkflowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <CrudForm schema={workflowSchema} mode="edit" id={id} />;
}
