'use client';

import { use } from 'react';
import { CrudForm } from '@/lib/crud/components/CrudForm';
import { showcaseSchema } from '@/lib/schemas/crm/showcase';

export default function EditShowcasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <CrudForm schema={showcaseSchema} mode="edit" id={id} />;
}
