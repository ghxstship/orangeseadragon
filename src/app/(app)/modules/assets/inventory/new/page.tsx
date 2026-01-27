'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { assetSchema } from '@/lib/schemas/asset';

export default function NewAssetPage() {
  return <CrudForm schema={assetSchema} mode="create" />;
}
