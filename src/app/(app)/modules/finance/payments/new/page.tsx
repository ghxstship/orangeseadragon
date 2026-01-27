'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { paymentSchema } from '@/lib/schemas/payment';

export default function NewPaymentPage() {
  return <CrudForm schema={paymentSchema} mode="create" />;
}
