'use client';

import { use } from 'react';
import { CrudForm } from '@/lib/crud/components/CrudForm';
import { opportunitySchema } from '@/lib/schemas/crm/opportunity';

export default function EditOpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <CrudForm schema={opportunitySchema} mode="edit" id={id} />;
}
