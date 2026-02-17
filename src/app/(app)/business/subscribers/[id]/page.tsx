'use client';

import { useParams } from 'next/navigation';
import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { subscriberSchema } from '@/lib/schemas';

export default function SubscriberDetailPage() {
  const params = useParams();
  return <CrudDetail schema={subscriberSchema} id={params.id as string} />;
}
