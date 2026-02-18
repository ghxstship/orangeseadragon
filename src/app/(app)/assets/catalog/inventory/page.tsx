'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { assetSchema } from '@/lib/schemas/assets/asset';

export default function InventoryPage() {
  return <CrudList schema={assetSchema} />;
}
