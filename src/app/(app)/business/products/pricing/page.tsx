'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { priceListSchema } from '@/lib/schemas/priceList';

export default function PricingPage() {
  return <CrudList schema={priceListSchema} />;
}
