'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { assetSchema } from '@/lib/schemas/asset';

export default function DeploymentPage() {
  return <CrudList schema={assetSchema} />;
}
