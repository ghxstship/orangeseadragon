'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { workflowRunSchema } from '@/lib/schemas/workflowRun';

export default function AutomationsPage() {
  return <CrudList schema={workflowRunSchema} />;
}
