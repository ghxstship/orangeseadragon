'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { categorySchema } from '@/lib/schemas/category';

export default function NewCategoryPage() {
  return <CrudForm schema={categorySchema} mode="create" />;
}
