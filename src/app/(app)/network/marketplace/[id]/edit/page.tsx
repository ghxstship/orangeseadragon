'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { marketplaceSchema } from '@/lib/schemas/marketplace';

export default function EditListingPage({ params }: { params: { id: string } }) {
  return <CrudForm schema={marketplaceSchema} mode="edit" id={params.id} />;
}
