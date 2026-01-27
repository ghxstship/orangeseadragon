'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { calendarSchema } from '@/lib/schemas/calendar';

export default function EditCalendarEventPage({ params }: { params: { id: string } }) {
  return <CrudForm schema={calendarSchema} mode="edit" id={params.id} />;
}
