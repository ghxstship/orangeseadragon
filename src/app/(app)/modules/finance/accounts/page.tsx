'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { accountSchema } from '@/lib/schemas/account';

export default function AccountsPage() {
  return <CrudList schema={accountSchema} />;
}
