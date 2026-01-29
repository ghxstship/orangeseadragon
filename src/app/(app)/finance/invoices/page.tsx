'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { invoiceSchema } from '@/lib/schemas/invoice';

export default function InvoicesPage() {
  return <CrudList schema={invoiceSchema} />;
}
