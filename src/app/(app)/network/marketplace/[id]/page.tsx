'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { marketplaceSchema } from '@/lib/schemas/marketplace';

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={marketplaceSchema} id={params.id} />;
}
