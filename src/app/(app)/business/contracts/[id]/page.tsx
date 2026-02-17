'use client';

import { useParams } from 'next/navigation';
import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { contractSchema } from '@/lib/schemas';

export default function ContractDetailPage() {
  const params = useParams();
  return <CrudDetail schema={contractSchema} id={params.id as string} />;
}
