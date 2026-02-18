'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { workflowSchema } from '@/lib/schemas/workflows/workflow';

export default function NewWorkflowPage() {
  return <CrudForm schema={workflowSchema} mode="create" />;
}
