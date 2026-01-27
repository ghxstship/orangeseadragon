'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { opportunitySchema } from '@/lib/schemas/opportunity';

export default function NewOpportunityPage() {
  return <CrudForm schema={opportunitySchema} mode="create" />;
}
