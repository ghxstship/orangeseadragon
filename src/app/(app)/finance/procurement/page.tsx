'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { purchaseOrderSchema } from '@/lib/schemas/operations/purchaseOrder';

export default function ProcurementPage() {
  return <CrudList schema={purchaseOrderSchema} />;
}
