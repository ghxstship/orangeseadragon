'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { eventSchema } from '@/lib/schemas/event';

export default function EventsPage() {
  return <CrudList schema={eventSchema} />;
}
