'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { assetSchema } from '@/lib/schemas/assets/asset';

export default function DeploymentPage() {
  return <CrudList schema={assetSchema} />;
}
