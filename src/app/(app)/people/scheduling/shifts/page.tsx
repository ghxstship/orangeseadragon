'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { scheduleSchema } from '@/lib/schemas/operations/schedule';

export default function ShiftsPage() {
  return <CrudList schema={scheduleSchema} filter={{ schedule_type: 'shift' }} />;
}
