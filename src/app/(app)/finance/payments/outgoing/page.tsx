'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { paymentSchema } from '@/lib/schemas/payment';

export default function OutgoingPaymentsPage() {
  return <CrudList schema={paymentSchema} filter={{ payment_direction: 'outgoing' }} />;
}
