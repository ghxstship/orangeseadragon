'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { workOrderSchema } from '@/lib/schemas/workOrder';

export default function WorkOrderDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={workOrderSchema} id={params.id} />;
}
