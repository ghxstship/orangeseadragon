'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { candidateSchema } from '@/lib/schemas/candidate';

export default function ApplicationsPage() {
  return <CrudList schema={candidateSchema} />;
}
