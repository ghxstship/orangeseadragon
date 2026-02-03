'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { candidateSchema } from '@/lib/schemas/candidate';

export default function CandidatesPage() {
  return <CrudList schema={candidateSchema} />;
}
