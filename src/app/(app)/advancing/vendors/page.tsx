'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { vendorRatingSchema } from '@/lib/schemas/advancing';

export default function VendorsPage() {
  return <CrudList schema={vendorRatingSchema} />;
}
