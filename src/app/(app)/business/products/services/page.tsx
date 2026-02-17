'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { productSchema } from '@/lib/schemas/product';

export default function ServicesPage() {
  return <CrudList schema={productSchema} filter={{ product_type: 'service' }} />;
}
