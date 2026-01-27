'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { chartOfAccountsSchema } from '@/lib/schemas/chartOfAccounts';

export default function ChartOfAccountsPage() {
  return <CrudList schema={chartOfAccountsSchema} />;
}
