'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { marketplaceSchema } from '@/lib/schemas/marketplace';

export default function NewListingPage() {
  return <CrudForm schema={marketplaceSchema} mode="create" />;
}
