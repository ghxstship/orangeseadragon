'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { sprintSchema } from '@/lib/schemas/sprint';

export default function SprintsPage() {
  return <CrudList schema={sprintSchema} />;
}
