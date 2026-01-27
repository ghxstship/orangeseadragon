'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { advancingSchema } from '@/lib/schemas/advancing';

export default function AdvancingPage() {
  return <CrudList schema={advancingSchema} />;
}
