'use client';

import { use } from 'react';
import { CrudForm } from '@/lib/crud/components/CrudForm';
import { calendarSchema } from '@/lib/schemas/calendar';

export default function EditCalendarEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <CrudForm schema={calendarSchema} mode="edit" id={id} />;
}
