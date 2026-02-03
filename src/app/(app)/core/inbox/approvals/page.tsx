'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { approvalSchema } from '@/lib/schemas/approval';

export default function ApprovalsPage() {
  return <CrudList schema={approvalSchema} />;
}
