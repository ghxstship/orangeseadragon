'use client';

import { use } from 'react';
import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { calendarSchema } from '@/lib/schemas/calendar';

export default function CalendarEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <CrudDetail schema={calendarSchema} id={id} />;
}
