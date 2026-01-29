'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { advancingSchema } from '@/lib/schemas/advancing';

export default function AdvancesPage() {
  return <CrudList schema={advancingSchema} />;
}
