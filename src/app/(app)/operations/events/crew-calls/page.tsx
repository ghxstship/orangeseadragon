'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { crewCallSchema } from '@/lib/schemas/production/crewCall';

export default function CrewCallsPage() {
  return <CrudList schema={crewCallSchema} />;
}
