'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { riderSchema } from '@/lib/schemas/rider';

export default function RidersPage() {
  return <CrudList schema={riderSchema} />;
}
