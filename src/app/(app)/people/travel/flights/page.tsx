'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { flightSchema } from '@/lib/schemas/operations/flight';

export default function FlightsPage() {
  return <CrudList schema={flightSchema} />;
}
