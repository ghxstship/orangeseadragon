'use client';

import { useParams } from 'next/navigation';
import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { showSchema } from '@/lib/schemas';

export default function ShowDetailPage() {
  const params = useParams();
  return <CrudDetail schema={showSchema} id={params.id as string} />;
}
