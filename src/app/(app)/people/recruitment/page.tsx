'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { candidateSchema } from '@/lib/schemas/people/candidate';

export default function RecruitmentPage() {
  return <CrudList schema={candidateSchema} />;
}
