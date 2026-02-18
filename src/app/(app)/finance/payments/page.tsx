'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { paymentSchema } from '@/lib/schemas/finance/payment';

export default function PaymentsPage() {
  return <CrudList schema={paymentSchema} />;
}
