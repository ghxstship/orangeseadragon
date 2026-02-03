'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { vendorSchema } from '@/lib/schemas/vendor';

export default function VendorsPage() {
  return <CrudList schema={vendorSchema} />;
}
