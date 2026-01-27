'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { workflowSchema } from '@/lib/schemas/workflow';

export default function WorkflowsPage() {
  return <CrudList schema={workflowSchema} />;
}
