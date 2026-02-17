'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { budgetLineItemSchema } from '@/lib/schemas/budgetLineItem';

export default function BudgetLineItemsPage() {
  return <CrudList schema={budgetLineItemSchema} />;
}
