'use client';

import { useParams } from 'next/navigation';
import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { workOrderSchema } from '@/lib/schemas';

export default function WorkOrderDetailPage() {
  const params = useParams();
  return <CrudDetail schema={workOrderSchema} id={params.id as string} />;
}
