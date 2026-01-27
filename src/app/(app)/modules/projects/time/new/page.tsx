'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { timeEntrySchema } from '@/lib/schemas/timeEntry';

export default function NewTimeEntryPage() {
  return <CrudForm schema={timeEntrySchema} mode="create" />;
}
