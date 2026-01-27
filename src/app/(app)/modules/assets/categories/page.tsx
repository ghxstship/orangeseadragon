'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { categorySchema } from '@/lib/schemas/category';

export default function CategoriesPage() {
  return <CrudList schema={categorySchema} />;
}
