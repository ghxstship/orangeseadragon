'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { advancingCatalogItemSchema } from '@/lib/schemas/advancing';

export default function CatalogItemDetailPage({ params }: { params: { id: string } }) {
    return <CrudDetail schema={advancingCatalogItemSchema} id={params.id} />;
}
