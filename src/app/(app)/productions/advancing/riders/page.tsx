'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { advancingSchema } from '@/lib/schemas/advancing';

export default function RidersPage() {
  return <CrudList schema={advancingSchema} filter={{ advance_type: 'rider' }} />;
}
