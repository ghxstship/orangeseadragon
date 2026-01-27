'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { workflowRunSchema } from '@/lib/schemas/workflowRun';

export default function WorkflowRunsPage({ params }: { params: { id: string } }) {
  return (
    <CrudList 
      schema={workflowRunSchema} 
      filter={{ workflow_id: params.id }}
    />
  );
}
