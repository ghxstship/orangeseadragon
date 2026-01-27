'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { contractSchema } from '@/lib/schemas/contract';

export default function ContractsPage() {
  return <CrudList schema={contractSchema} />;
}
