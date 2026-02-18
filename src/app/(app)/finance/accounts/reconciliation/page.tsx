'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { bankAccountSchema } from '@/lib/schemas/finance/bankAccount';

export default function ReconciliationPage() {
  return <CrudList schema={bankAccountSchema} />;
}
