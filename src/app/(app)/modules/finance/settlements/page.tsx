'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { settlementSchema } from '@/lib/schemas/settlement';

export default function SettlementsPage() {
  return <CrudList schema={settlementSchema} />;
}
