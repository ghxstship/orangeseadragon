'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { advancingCatalogItemSchema } from '@/lib/schemas/advancing';

export default function AdvancingCatalogPage() {
    return <CrudList schema={advancingCatalogItemSchema} />;
}
