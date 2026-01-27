'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { bankAccountSchema } from '@/lib/schemas/bankAccount';

export default function NewBankAccountPage() {
  return <CrudForm schema={bankAccountSchema} mode="create" />;
}
