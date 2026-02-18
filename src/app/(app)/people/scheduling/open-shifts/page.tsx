'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { openShiftSchema } from '@/lib/schemas/operations/shiftSwap';

export default function OpenShiftsPage() {
  return <CrudList schema={openShiftSchema} />;
}
