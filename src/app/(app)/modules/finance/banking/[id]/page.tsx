'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { bankAccountSchema } from '@/lib/schemas/bankAccount';

export default function BankAccountDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={bankAccountSchema} id={params.id} />;
}
