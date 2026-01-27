'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { eventSchema } from '@/lib/schemas/event';

export default function NewEventPage() {
  return <CrudForm schema={eventSchema} mode="create" />;
}
