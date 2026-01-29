'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { peopleSchema } from '@/lib/schemas/people';

export default function RostersPage() {
  return <CrudList schema={peopleSchema} />;
}
