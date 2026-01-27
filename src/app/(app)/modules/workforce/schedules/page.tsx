'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { scheduleSchema } from '@/lib/schemas/schedule';

export default function SchedulesPage() {
  return <CrudList schema={scheduleSchema} />;
}
