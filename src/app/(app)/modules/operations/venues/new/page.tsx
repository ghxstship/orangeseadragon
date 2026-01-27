'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { venueSchema } from '@/lib/schemas/venue';

export default function NewVenuePage() {
  return <CrudForm schema={venueSchema} mode="create" />;
}
