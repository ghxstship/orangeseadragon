'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { bankConnectionSchema } from '@/lib/schemas/bankConnection';

export default function BankingPage() {
  return <CrudList schema={bankConnectionSchema} />;
}
