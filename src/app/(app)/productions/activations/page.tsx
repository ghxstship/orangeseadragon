'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { eventSchema } from '@/lib/schemas/production/event';

export default function ActivationsPage() {
  return <CrudList schema={eventSchema} filter={{ event_type: 'activation' }} />;
}
