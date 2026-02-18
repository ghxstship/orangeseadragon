'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { permitSchema } from '@/lib/schemas/operations/permit';

export default function PermitsPage() {
  return <CrudList schema={permitSchema} />;
}
