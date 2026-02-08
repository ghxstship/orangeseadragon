'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { recurringInvoiceSchema } from '@/lib/schemas/recurringInvoice';

export default function RecurringInvoiceDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={recurringInvoiceSchema} id={params.id} />;
}
