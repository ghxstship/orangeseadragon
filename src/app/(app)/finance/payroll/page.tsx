'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { payrollRunSchema } from '@/lib/schemas/finance/payrollRun';

export default function PayrollPage() {
  return <CrudList schema={payrollRunSchema} />;
}
