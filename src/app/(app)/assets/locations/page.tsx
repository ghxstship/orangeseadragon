'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { venueSchema } from '@/lib/schemas/venue';

export default function LocationsPage() {
  return <CrudList schema={venueSchema} filter={{ venue_type: 'warehouse' }} />;
}
