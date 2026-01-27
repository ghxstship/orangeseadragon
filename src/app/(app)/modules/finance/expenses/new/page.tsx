'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { expenseSchema } from '@/lib/schemas/expense';

export default function NewExpensePage() {
  return <CrudForm schema={expenseSchema} mode="create" />;
}
