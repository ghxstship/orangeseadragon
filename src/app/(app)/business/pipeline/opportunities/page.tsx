'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { dealSchema } from '@/lib/schemas/crm/deal';

export default function OpportunitiesPage() {
  return <CrudList schema={dealSchema} filter={{ stage: 'opportunity' }} />;
}
