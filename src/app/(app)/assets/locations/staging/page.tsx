'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { venueSchema } from '@/lib/schemas/production/venue';

export default function StagingPage() {
  return <CrudList schema={venueSchema} filter={{ venue_type: 'staging' }} />;
}
