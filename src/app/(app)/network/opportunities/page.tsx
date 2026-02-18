'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { opportunitySchema } from '@/lib/schemas/crm/opportunity';

export default function OpportunitiesPage() {
  return <CrudList schema={opportunitySchema} />;
}
