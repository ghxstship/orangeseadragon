'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { workOrderSchema } from '@/lib/schemas/operations/workOrder';

export default function WorkOrdersPage() {
  return <CrudList schema={workOrderSchema} />;
}
