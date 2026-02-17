'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { payrollDeductionSchema } from '@/lib/schemas/payrollDeduction';

export default function DeductionsPage() {
  return <CrudList schema={payrollDeductionSchema} />;
}
