'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { scheduleSchema } from '@/lib/schemas/schedule';

export default function NewSchedulePage() {
  return <CrudForm schema={scheduleSchema} mode="create" />;
}
