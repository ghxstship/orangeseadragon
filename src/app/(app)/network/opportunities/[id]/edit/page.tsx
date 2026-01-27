'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { opportunitySchema } from '@/lib/schemas/opportunity';

export default function EditOpportunityPage({ params }: { params: { id: string } }) {
  return <CrudForm schema={opportunitySchema} mode="edit" id={params.id} />;
}
