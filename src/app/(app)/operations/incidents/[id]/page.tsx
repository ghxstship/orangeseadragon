'use client';

import { useParams } from 'next/navigation';
import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { incidentSchema } from '@/lib/schemas';

export default function IncidentDetailPage() {
  const params = useParams();
  return <CrudDetail schema={incidentSchema} id={params.id as string} />;
}
