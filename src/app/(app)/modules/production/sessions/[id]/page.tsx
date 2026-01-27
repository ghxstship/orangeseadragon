'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { eventSessionSchema } from '@/lib/schemas/eventSession';

export default function SessionDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={eventSessionSchema} id={params.id} />;
}
