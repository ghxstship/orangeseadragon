'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { purchaseOrderSchema } from '@/lib/schemas/purchaseOrder';

export default function NewPurchaseOrderPage() {
  return <CrudForm schema={purchaseOrderSchema} mode="create" />;
}
