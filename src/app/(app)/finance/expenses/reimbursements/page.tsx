'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { expenseSchema } from '@/lib/schemas/finance/expense';

export default function ReimbursementsPage() {
  return <CrudList schema={expenseSchema} filter={{ expense_type: 'reimbursement' }} />;
}
