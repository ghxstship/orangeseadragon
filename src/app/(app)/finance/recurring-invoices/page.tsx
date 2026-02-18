'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { recurringInvoiceSchema } from '@/lib/schemas/finance/recurringInvoice';

export default function RecurringInvoicesPage() {
  return <CrudList schema={recurringInvoiceSchema} />;
}
