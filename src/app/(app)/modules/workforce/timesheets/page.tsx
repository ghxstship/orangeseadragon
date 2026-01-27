'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { timesheetSchema } from '@/lib/schemas/timesheet';

export default function TimesheetsPage() {
  return <CrudList schema={timesheetSchema} />;
}
