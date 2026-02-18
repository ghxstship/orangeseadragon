'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { venueSchema } from '@/lib/schemas/production/venue';

export default function FloorPlansPage() {
  return <CrudList schema={venueSchema} />;
}
