'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { accountSchema } from '@/lib/schemas/account';

export default function GLAccountsPage() {
  return <CrudList schema={accountSchema} filter={{ account_type: 'gl' }} />;
}
