'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { venueSchema } from '@/lib/schemas/venue';

export default function VenuesPage() {
  return <CrudList schema={venueSchema} />;
}
