'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { dealSchema } from '@/lib/schemas/deal';

export default function LeadsPage() {
  return <CrudList schema={dealSchema} filter={{ stage: 'lead' }} />;
}
