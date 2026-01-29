'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { accountSchema } from '@/lib/schemas/account';

export default function BankAccountsPage() {
  return <CrudList schema={accountSchema} filter={{ account_type: 'bank' }} />;
}
