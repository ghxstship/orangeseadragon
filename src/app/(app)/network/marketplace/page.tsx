'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { marketplaceSchema } from '@/lib/schemas/crm/marketplace';

export default function MarketplacePage() {
  return <CrudList schema={marketplaceSchema} />;
}
