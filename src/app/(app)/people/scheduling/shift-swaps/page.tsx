'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { shiftSwapRequestSchema } from '@/lib/schemas/operations/shiftSwap';

export default function ShiftSwapsPage() {
  return <CrudList schema={shiftSwapRequestSchema} />;
}
