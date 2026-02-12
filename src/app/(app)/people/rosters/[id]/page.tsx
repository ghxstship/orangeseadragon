'use client';

import { useParams } from 'next/navigation';
import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { peopleSchema } from '@/lib/schemas';

export default function PersonDetailPage() {
  const params = useParams();
  return <CrudDetail schema={peopleSchema} id={params.id as string} />;
}
