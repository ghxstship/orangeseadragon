'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { opportunitySchema } from '@/lib/schemas/opportunity';

export default function OpportunityDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={opportunitySchema} id={params.id} />;
}
