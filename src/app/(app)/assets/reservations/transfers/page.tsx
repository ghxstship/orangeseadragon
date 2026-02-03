'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { assetTransferSchema } from '@/lib/schemas/assetTransfer';

export default function TransfersPage() {
  return <CrudList schema={assetTransferSchema} />;
}
