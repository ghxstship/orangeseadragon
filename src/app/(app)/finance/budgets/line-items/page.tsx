'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { budgetSchema } from '@/lib/schemas/budget';

export default function BudgetLineItemsPage() {
  return <CrudList schema={budgetSchema} />;
}
