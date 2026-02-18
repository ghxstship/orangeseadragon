'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { paymentSchema } from '@/lib/schemas/finance/payment';

export default function IncomingPaymentsPage() {
  return <CrudList schema={paymentSchema} filter={{ payment_direction: 'incoming' }} />;
}
