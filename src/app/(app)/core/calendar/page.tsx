'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { calendarSchema } from '@/lib/schemas/calendar';

export default function CalendarPage() {
  return <CrudList schema={calendarSchema} />;
}
