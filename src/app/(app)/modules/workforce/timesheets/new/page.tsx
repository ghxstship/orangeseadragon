'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { timesheetSchema } from '@/lib/schemas/timesheet';

export default function NewTimesheetPage() {
  return <CrudForm schema={timesheetSchema} mode="create" />;
}
