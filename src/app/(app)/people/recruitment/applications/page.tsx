'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { candidateSchema } from '@/lib/schemas/people/candidate';

export default function ApplicationsPage() {
  return <CrudList schema={candidateSchema} />;
}
