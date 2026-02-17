'use client';

import { useParams } from 'next/navigation';
import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { eventSchema } from '@/lib/schemas';

export default function EventDetailPage() {
  const params = useParams();
  return <CrudDetail schema={eventSchema} id={params.id as string} />;
}
