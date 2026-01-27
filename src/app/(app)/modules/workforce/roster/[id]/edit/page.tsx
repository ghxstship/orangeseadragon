'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { peopleSchema } from '@/lib/schemas/people';

export default function EditPersonPage({ params }: { params: { id: string } }) {
  return <CrudForm schema={peopleSchema} mode="edit" id={params.id} />;
}
