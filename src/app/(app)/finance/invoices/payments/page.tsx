'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { paymentSchema } from '@/lib/schemas/payment';

export default function InvoicePaymentsPage() {
  return <CrudList schema={paymentSchema} />;
}
