'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { advanceItemSchema } from '@/lib/schemas/advancing';

export default function AdvanceItemsPage() {
  return <CrudList schema={advanceItemSchema} />;
}
