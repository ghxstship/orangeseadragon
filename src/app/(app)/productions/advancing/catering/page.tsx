'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { cateringSchema } from '@/lib/schemas/catering';

export default function CateringPage() {
  return <CrudList schema={cateringSchema} />;
}
