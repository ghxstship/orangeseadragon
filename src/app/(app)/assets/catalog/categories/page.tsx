'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { platformCatalogCategorySchema } from '@/lib/schemas/catalog';

export default function CategoriesPage() {
  return <CrudList schema={platformCatalogCategorySchema} />;
}
