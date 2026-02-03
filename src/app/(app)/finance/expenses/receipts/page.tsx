'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { expenseSchema } from '@/lib/schemas/expense';

export default function ReceiptsPage() {
  return <CrudList schema={expenseSchema} />;
}
