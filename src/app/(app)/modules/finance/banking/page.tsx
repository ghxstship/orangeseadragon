'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { bankAccountSchema } from '@/lib/schemas/bankAccount';

export default function BankingPage() {
  return <CrudList schema={bankAccountSchema} />;
}
