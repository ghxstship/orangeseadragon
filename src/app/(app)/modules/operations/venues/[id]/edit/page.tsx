'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { venueSchema } from '@/lib/schemas/venue';

export default function EditVenuePage({ params }: { params: { id: string } }) {
  return <CrudForm schema={venueSchema} mode="edit" id={params.id} />;
}
