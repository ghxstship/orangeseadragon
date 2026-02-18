'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { cateringSchema } from '@/lib/schemas/operations/catering';

export default function CateringPage() {
  return <CrudList schema={cateringSchema} />;
}
