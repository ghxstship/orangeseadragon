'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { invoiceSchema } from '@/lib/schemas/invoice';

export default function NewInvoicePage() {
  return <CrudForm schema={invoiceSchema} mode="create" />;
}
