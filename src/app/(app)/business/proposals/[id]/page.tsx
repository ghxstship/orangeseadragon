'use client';

import { useParams } from 'next/navigation';
import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { proposalSchema } from '@/lib/schemas';

export default function ProposalDetailPage() {
  const params = useParams();
  return <CrudDetail schema={proposalSchema} id={params.id as string} />;
}
