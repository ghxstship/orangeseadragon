'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { marketplaceSchema } from '@/lib/schemas/marketplace';

export default function MarketplacePage() {
  return <CrudList schema={marketplaceSchema} />;
}
