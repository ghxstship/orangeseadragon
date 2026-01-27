'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { proposalSchema } from '@/lib/schemas/proposal';

export default function NewProposalPage() {
  return <CrudForm schema={proposalSchema} mode="create" />;
}
