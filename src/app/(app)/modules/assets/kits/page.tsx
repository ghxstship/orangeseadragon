'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { kitSchema } from '@/lib/schemas/kit';

export default function KitsPage() {
  return <CrudList schema={kitSchema} />;
}
