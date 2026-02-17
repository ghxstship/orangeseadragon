'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { invoiceLineItemSchema } from '@/lib/schemas/invoiceLineItem';

export default function InvoiceLineItemsPage() {
  return <CrudList schema={invoiceLineItemSchema} />;
}
