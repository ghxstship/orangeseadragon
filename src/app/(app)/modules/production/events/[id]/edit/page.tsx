'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { eventSchema } from '@/lib/schemas/event';

export default function EditEventPage({ params }: { params: { id: string } }) {
  return <CrudForm schema={eventSchema} mode="edit" id={params.id} />;
}
