'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { paymentSchema } from '@/lib/schemas/finance/payment';

export default function InvoicePaymentsPage() {
  return <CrudList schema={paymentSchema} filter={{ payment_type: 'invoice' }} />;
}
