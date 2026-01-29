'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { punchItemSchema } from '@/lib/schemas/punchItem';

export default function PunchListsPage() {
  return <CrudList schema={punchItemSchema} />;
}
