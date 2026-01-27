'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { assetSchema } from '@/lib/schemas/asset';

export default function EditAssetPage({ params }: { params: { id: string } }) {
  return <CrudForm schema={assetSchema} mode="edit" id={params.id} />;
}
