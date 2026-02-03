'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { workflowTriggerSchema } from '@/lib/schemas/workflowTrigger';

export default function TriggersPage() {
  return <CrudList schema={workflowTriggerSchema} />;
}
