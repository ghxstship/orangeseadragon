'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { eventSessionSchema } from '@/lib/schemas/eventSession';

export default function NewSessionPage() {
  return (
    <CrudForm
      schema={eventSessionSchema}
      mode="create"
    />
  );
}
