'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { candidateSchema } from '@/lib/schemas/candidate';

export default function CandidateDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={candidateSchema} id={params.id} />;
}
