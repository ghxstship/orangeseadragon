'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { incidentSchema } from '@/lib/schemas/incident';

export default function NewIncidentPage() {
  return <CrudForm schema={incidentSchema} mode="create" />;
}
