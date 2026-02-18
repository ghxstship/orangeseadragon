'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { punchListSchema } from '@/lib/schemas/operations/punchList';

export default function PunchListsPage() {
  return <CrudList schema={punchListSchema} />;
}
