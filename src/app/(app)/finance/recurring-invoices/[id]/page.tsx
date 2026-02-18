'use client';

import { use } from 'react';
import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { recurringInvoiceSchema } from '@/lib/schemas/finance/recurringInvoice';

export default function RecurringInvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <CrudDetail schema={recurringInvoiceSchema} id={id} />;
}
