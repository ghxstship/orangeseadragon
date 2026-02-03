'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { punchListSchema } from '@/lib/schemas/punchList';

export default function PunchListsPage() {
  return <CrudList schema={punchListSchema} />;
}
