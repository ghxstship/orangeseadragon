'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { workflowSchema } from '@/lib/schemas/workflow';

export default function WorkflowDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={workflowSchema} id={params.id} />;
}
