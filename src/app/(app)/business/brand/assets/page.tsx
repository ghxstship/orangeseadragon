'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { brandAssetSchema } from '@/lib/schemas/brandAsset';

export default function BrandAssetsPage() {
  return <CrudList schema={brandAssetSchema} />;
}
