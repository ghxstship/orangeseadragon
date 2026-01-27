'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { timeEntrySchema } from '@/lib/schemas/timeEntry';

export default function TimeEntryDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={timeEntrySchema} id={params.id} />;
}
