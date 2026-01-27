'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { venueSchema } from '@/lib/schemas/venue';

export default function VenueDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={venueSchema} id={params.id} />;
}
