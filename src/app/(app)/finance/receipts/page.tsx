'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { receiptScanSchema } from '@/lib/schemas/finance/receiptScan';

export default function ReceiptsPage() {
  return <CrudList schema={receiptScanSchema} />;
}
