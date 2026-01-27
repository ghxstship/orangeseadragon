'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { calendarSchema } from '@/lib/schemas/calendar';

export default function NewCalendarEventPage() {
  return <CrudForm schema={calendarSchema} mode="create" />;
}
