'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { advanceItemFulfillmentSchema } from '@/lib/schemas/advancing';

export default function FulfillmentPage() {
  return <CrudList schema={advanceItemFulfillmentSchema} />;
}
