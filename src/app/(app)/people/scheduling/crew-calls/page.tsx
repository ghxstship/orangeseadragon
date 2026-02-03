'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { crewCallSchema } from '@/lib/schemas/crewCall';

export default function SchedulingCrewCallsPage() {
  return <CrudList schema={crewCallSchema} />;
}
