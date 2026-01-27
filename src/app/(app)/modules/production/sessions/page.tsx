'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { eventSessionSchema } from '@/lib/schemas/eventSession';

export default function SessionsPage() {
  return (
    <CrudList
      schema={eventSessionSchema}
    />
  );
}
