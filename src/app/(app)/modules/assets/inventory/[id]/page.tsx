'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { assetSchema } from '@/lib/schemas/asset';

export default function AssetDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={assetSchema} id={params.id} />;
}
