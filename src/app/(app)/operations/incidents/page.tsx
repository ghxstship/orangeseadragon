'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { incidentSchema } from '@/lib/schemas/incident';

export default function IncidentsPage() {
  return <CrudList schema={incidentSchema} />;
}
