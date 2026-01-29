'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { productionSchema } from '@/lib/schemas/production';

export default function ProductionsListPage() {
  return <CrudList schema={productionSchema} />;
}
