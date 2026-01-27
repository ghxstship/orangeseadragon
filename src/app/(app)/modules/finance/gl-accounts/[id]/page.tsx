'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { chartOfAccountsSchema } from '@/lib/schemas/chartOfAccounts';

export default function AccountDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={chartOfAccountsSchema} id={params.id} />;
}
