'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { storageBinSchema } from '@/lib/schemas/assets/storageBin';

export default function BinsPage() {
  return <CrudList schema={storageBinSchema} />;
}
