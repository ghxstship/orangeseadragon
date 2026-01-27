'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { dealSchema } from '@/lib/schemas/deal';

export default function DealsPage() {
  return <CrudList schema={dealSchema} />;
}
