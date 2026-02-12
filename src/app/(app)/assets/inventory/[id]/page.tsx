'use client';

import { useParams } from 'next/navigation';
import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { assetSchema } from '@/lib/schemas';

export default function AssetDetailPage() {
  const params = useParams();
  return <CrudDetail schema={assetSchema} id={params.id as string} />;
}
