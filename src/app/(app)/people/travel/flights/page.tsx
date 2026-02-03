'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { flightSchema } from '@/lib/schemas/flight';

export default function FlightsPage() {
  return <CrudList schema={flightSchema} />;
}
