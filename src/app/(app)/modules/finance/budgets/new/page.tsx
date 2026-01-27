'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { budgetSchema } from '@/lib/schemas/budget';

export default function NewBudgetPage() {
  return <CrudForm schema={budgetSchema} mode="create" />;
}
