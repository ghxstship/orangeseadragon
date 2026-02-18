'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { workflowTriggerSchema } from '@/lib/schemas/workflows/workflowTrigger';

export default function TriggersPage() {
  return <CrudList schema={workflowTriggerSchema} />;
}
