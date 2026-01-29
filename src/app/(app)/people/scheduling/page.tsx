'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { scheduleSchema } from '@/lib/schemas/schedule';

export default function SchedulingPage() {
  return <CrudList schema={scheduleSchema} />;
}
