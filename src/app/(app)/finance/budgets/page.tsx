'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { budgetSchema } from '@/lib/schemas/budget';

export default function BudgetsPage() {
  return <CrudList schema={budgetSchema} />;
}
