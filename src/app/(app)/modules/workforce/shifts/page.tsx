'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { shiftSchema } from '@/lib/schemas/shift';

export default function ShiftsPage() {
  return <CrudList schema={shiftSchema} />;
}
