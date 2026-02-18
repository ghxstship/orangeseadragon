'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { workOrderSchema } from '@/lib/schemas/operations/workOrder';

export default function BuildStrikePage() {
  return <CrudList schema={workOrderSchema} filter={{ work_order_type: 'install' }} />;
}
