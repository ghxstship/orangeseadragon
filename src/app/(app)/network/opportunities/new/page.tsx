'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { opportunitySchema } from '@/lib/schemas/crm/opportunity';

export default function NewOpportunityPage() {
  return <CrudForm schema={opportunitySchema} mode="create" />;
}
