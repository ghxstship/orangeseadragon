'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { subscriberSchema } from '@/lib/schemas/subscriber';

export default function SubscriberDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={subscriberSchema} id={params.id} />;
}
