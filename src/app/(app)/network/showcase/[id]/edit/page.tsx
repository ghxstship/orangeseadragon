'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { showcaseSchema } from '@/lib/schemas/showcase';

export default function EditShowcasePage({ params }: { params: { id: string } }) {
  return <CrudForm schema={showcaseSchema} mode="edit" id={params.id} />;
}
