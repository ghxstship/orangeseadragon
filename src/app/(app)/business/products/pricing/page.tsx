'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { priceListSchema } from '@/lib/schemas/finance/priceList';

export default function PricingPage() {
  return <CrudList schema={priceListSchema} />;
}
