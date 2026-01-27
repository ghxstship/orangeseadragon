'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { chartOfAccountsSchema } from '@/lib/schemas/chartOfAccounts';

export default function NewAccountPage() {
  return <CrudForm schema={chartOfAccountsSchema} mode="create" />;
}
