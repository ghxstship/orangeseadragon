'use client';

import { use } from 'react';
import { CrudList } from '@/lib/crud/components/CrudList';
import { workflowRunSchema } from '@/lib/schemas/workflowRun';

export default function WorkflowRunsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <CrudList 
      schema={workflowRunSchema} 
      filter={{ workflow_id: id }}
    />
  );
}
