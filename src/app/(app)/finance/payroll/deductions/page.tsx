'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { payrollRunSchema } from '@/lib/schemas/payrollRun';

export default function DeductionsPage() {
  return <CrudList schema={payrollRunSchema} />;
}
