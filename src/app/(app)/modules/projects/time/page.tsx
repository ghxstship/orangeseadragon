'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { timeEntrySchema } from '@/lib/schemas/timeEntry';

export default function TimeEntriesPage() {
  return <CrudList schema={timeEntrySchema} />;
}
