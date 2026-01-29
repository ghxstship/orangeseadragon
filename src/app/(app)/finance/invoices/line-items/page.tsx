'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { invoiceSchema } from '@/lib/schemas/invoice';

export default function InvoiceLineItemsPage() {
  return <CrudList schema={invoiceSchema} />;
}
