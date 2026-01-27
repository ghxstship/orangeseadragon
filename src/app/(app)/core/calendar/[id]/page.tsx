'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { calendarSchema } from '@/lib/schemas/calendar';

export default function CalendarEventPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={calendarSchema} id={params.id} />;
}
