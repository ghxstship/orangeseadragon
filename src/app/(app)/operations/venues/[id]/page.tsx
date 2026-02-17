'use client';

import { useParams } from 'next/navigation';
import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { venueSchema } from '@/lib/schemas';

export default function VenueDetailPage() {
  const params = useParams();
  return <CrudDetail schema={venueSchema} id={params.id as string} />;
}
