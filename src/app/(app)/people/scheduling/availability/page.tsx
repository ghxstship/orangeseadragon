'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { scheduleSchema } from '@/lib/schemas/schedule';

export default function AvailabilityPage() {
  return <CrudList schema={scheduleSchema} />;
}
