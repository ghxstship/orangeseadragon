'use client';

import { useParams } from 'next/navigation';
import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { dealSchema } from '@/lib/schemas';

export default function DealDetailPage() {
  const params = useParams();
  return <CrudDetail schema={dealSchema} id={params.id as string} />;
}
