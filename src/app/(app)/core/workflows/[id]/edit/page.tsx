'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { workflowSchema } from '@/lib/schemas/workflow';

export default function EditWorkflowPage({ params }: { params: { id: string } }) {
  return <CrudForm schema={workflowSchema} mode="edit" id={params.id} />;
}
