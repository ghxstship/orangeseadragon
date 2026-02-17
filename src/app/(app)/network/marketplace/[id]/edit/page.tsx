'use client';

import { use } from 'react';
import { CrudForm } from '@/lib/crud/components/CrudForm';
import { marketplaceSchema } from '@/lib/schemas/marketplace';

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <CrudForm schema={marketplaceSchema} mode="edit" id={id} />;
}
