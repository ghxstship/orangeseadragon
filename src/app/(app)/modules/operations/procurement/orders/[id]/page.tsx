'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { purchaseOrderSchema } from '@/lib/schemas/purchaseOrder';

export default function PurchaseOrderDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={purchaseOrderSchema} id={params.id} />;
}
