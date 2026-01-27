'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { payrollRunSchema } from '@/lib/schemas/payrollRun';

export default function NewPayrollRunPage() {
  return <CrudForm schema={payrollRunSchema} mode="create" />;
}
