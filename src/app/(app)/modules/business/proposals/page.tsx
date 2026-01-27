'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { proposalSchema } from '@/lib/schemas/proposal';

export default function ProposalsPage() {
  return <CrudList schema={proposalSchema} />;
}
