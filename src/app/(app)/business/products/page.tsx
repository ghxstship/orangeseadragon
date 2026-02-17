'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { productSchema } from '@/lib/schemas/product';

export default function ProductsPage() {
  return <CrudList schema={productSchema} />;
}
